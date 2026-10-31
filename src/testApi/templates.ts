import { Template } from "models/template";

// Set REACT_APP_USE_TEST_API=false to connect development builds to the real API.
export const testApiEnabled = process.env.NODE_ENV === "development" && process.env.REACT_APP_USE_TEST_API !== "false";
export const testAccessToken = "sniptext-test-token";

const seed = [
  ["미팅 일정 제안", "/일정", "안녕하세요. {{날짜}} {{시간}}에 {{장소}}에서 미팅을 진행하면 어떨까요? 가능하신지 회신 부탁드립니다."],
  ["감사 인사", "/감사", "{{담당자명}}님, {{회사명}}과 함께할 수 있어 감사합니다. 앞으로도 잘 부탁드립니다."],
  ["정중한 거절 메일", "/거절", "{{요청내용}}에 대해 제안해 주셔서 감사합니다. 아쉽지만 이번에는 함께하기 어려울 것 같습니다. 양해 부탁드립니다."],
  ["내 계좌 번호", "/계좌", "스닙은행 123-456-789012 (예금주: 스닙이)"],
  ["프로젝트 견적 안내", "/견적", "안녕하세요, {{고객명}}님. 요청 주신 프로젝트의 예상 견적은 {{금액}}원이며, 작업 기간은 {{기간}}입니다. 검토 후 편하게 회신 부탁드립니다."],
  ["간단한 자기소개", "/소개", "안녕하세요. {{회사명}}에서 {{직무}}를 맡고 있는 {{이름}}입니다. 만나 뵙게 되어 반갑습니다."],
];
const variablesOf = (content: string) => Array.from(new Set(Array.from(content.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g), match => match[1])));
const json = (status: number, code: string, result: unknown, message = "요청을 처리했습니다.") => new Response(JSON.stringify({ isSuccess: status < 400, code, message, result }), { status, headers: { "Content-Type": "application/json" } });

/** A browser-only test API. Changes survive requests, and reset on page reload. */
export function createTemplatesTestApi(): typeof fetch {
  let nextId = seed.length + 1;
  let templates: Template[] = seed.map(([title, shortcut, content], index) => ({ templateId: index + 1, title, shortcut, content, variables: variablesOf(content), lastUsedAt: null, createdAt: new Date().toISOString(), editedAt: new Date().toISOString() }));
  return async (input, init) => {
    const request = new Request(new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, window.location.origin), init);
    if (request.signal.aborted) throw new DOMException("요청이 취소되었습니다.", "AbortError");
    if (request.headers.get("Authorization") !== `Bearer ${testAccessToken}`) return json(401, "AUTH401_1", null, "로그인이 필요합니다.");
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/api\/v1\/templates(?:\/(\d+))?$/);
    if (!match) return json(404, "NOT_FOUND", null, "테스트 API가 없는 경로입니다.");
    const id = match[1] ? Number(match[1]) : null;
    const template = templates.find(item => item.templateId === id);
    if (request.method === "GET") {
      if (id !== null) return template ? json(200, "TEMPLATE200_2", template) : json(404, "TEMPLATE404_1", null, "템플릿을 찾을 수 없습니다.");
      const sort = url.searchParams.get("sort") || "RECENT_USED";
      if (!["RECENT_USED", "RECENT_EDITED"].includes(sort)) return json(400, "TEMPLATE400_8", null, "지원하지 않는 정렬 기준입니다.");
      const items = [...templates].sort((a, b) => (sort === "RECENT_EDITED" ? b.editedAt.localeCompare(a.editedAt) : (b.lastUsedAt || "").localeCompare(a.lastUsedAt || "")) || a.templateId - b.templateId);
      return json(200, "TEMPLATE200_1", { sort, totalCount: items.length, templates: items });
    }
    if (id !== null && !template) return json(404, "TEMPLATE404_1", null, "템플릿을 찾을 수 없습니다.");
    if (request.method === "DELETE" && template) {
      templates = templates.filter(item => item.templateId !== id);
      const deletedAt = new Date().toISOString();
      return json(200, "TEMPLATE200_4", { templateId: id, title: template.title, deletedAt, purgeAt: new Date(Date.now() + 30 * 86400000).toISOString() });
    }
    if ((request.method === "POST" && id === null) || (request.method === "PUT" && template)) {
      const body = await request.json().catch(() => null);
      if (!body || typeof body.title !== "string" || !body.title.trim()) return json(400, "TEMPLATE400_1", null, "제목을 입력해 주세요.");
      if (typeof body.shortcut !== "string" || !/^\/[^\s/]+$/.test(body.shortcut)) return json(400, "TEMPLATE400_3", null, "단축어는 /로 시작하고 공백 없이 입력해 주세요.");
      if (typeof body.content !== "string" || !body.content.trim()) return json(400, "TEMPLATE400_5", null, "내용을 입력해 주세요.");
      if (templates.some(item => item.templateId !== id && item.shortcut === body.shortcut)) return json(409, "TEMPLATE409_1", null, "이미 사용 중인 단축어입니다.");
      const saved: Template = { templateId: template?.templateId ?? nextId++, title: body.title.trim(), shortcut: body.shortcut, content: body.content, variables: variablesOf(body.content), lastUsedAt: template?.lastUsedAt ?? null, createdAt: template?.createdAt ?? new Date().toISOString(), editedAt: new Date().toISOString() };
      templates = template ? templates.map(item => item.templateId === id ? saved : item) : [...templates, saved];
      return json(template ? 200 : 201, template ? "TEMPLATE200_3" : "TEMPLATE201_1", saved);
    }
    return json(405, "METHOD_NOT_ALLOWED", null, "지원하지 않는 요청입니다.");
  };
}

export function installTemplatesTestApi() {
  const originalFetch = window.fetch.bind(window);
  const testFetch = createTemplatesTestApi();
  window.fetch = (input, init) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, window.location.origin);
    return url.origin === window.location.origin && /^\/api\/v1\/templates(?:\/\d+)?$/.test(url.pathname) ? testFetch(input, init) : originalFetch(input, init);
  };
}
