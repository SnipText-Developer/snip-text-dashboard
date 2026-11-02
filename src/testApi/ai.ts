import { ToneStyle } from "api/ai/correctTone";
import { testAccessToken } from "./templates";

const path = "/api/v1/ai/tone-corrections";
const frames: Record<ToneStyle, [string, string]> = {
  BOSS_EXTERNAL: ["안녕하세요. 요청하신 사항에 대해 안내드립니다.", "검토 후 회신 부탁드립니다. 감사합니다."],
  REPORT_OFFICIAL: ["다음과 같이 보고드립니다.", "이상입니다."],
  MARKETING: ["새로운 소식을 전해드려요!", "많은 관심 부탁드려요."],
  NOTICE: ["안내드립니다.", "참고 부탁드립니다."],
  SOFT_POLITE: ["안녕하세요.", "확인 부탁드립니다. 감사합니다."],
  CASUAL: ["안녕하세요!", "편하게 말씀해 주세요!"],
  ESSAY: ["문득 이런 생각이 들었습니다.", "이 마음이 잘 전해지기를 바랍니다."],
};

interface AiTestApiOptions {
  plan?: "FREE" | "PRO";
  limit?: number;
}

const json = (status: number, code: string, result: unknown, message: string) => new Response(
  JSON.stringify({ isSuccess: status < 400, code, message, result }),
  { status, headers: { "Content-Type": "application/json" } },
);

function nextReset() {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate() + 1) - 9 * 60 * 60 * 1000).toISOString();
}

/** Local UI fixture, not AI generation. State resets on reload or at midnight KST. */
export function createAiTestApi({ plan = "PRO", limit = 10 }: AiTestApiOptions = {}): typeof fetch {
  let usedCount = 0;
  let resetAt = nextReset();
  return async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const request = new Request(new URL(url, "http://localhost"), init);
    if (request.signal.aborted) throw new DOMException("요청이 취소되었습니다.", "AbortError");
    if (request.headers.get("Authorization") !== `Bearer ${testAccessToken}`) return json(401, "AUTH401_1", null, "로그인이 필요합니다.");
    if (new URL(request.url).pathname !== path) return json(404, "NOT_FOUND", null, "테스트 API가 없는 경로입니다.");
    if (request.method !== "POST") return json(405, "METHOD_NOT_ALLOWED", null, "지원하지 않는 요청입니다.");
    const body = await request.json().catch(() => null);
    if (request.signal.aborted) throw new DOMException("요청이 취소되었습니다.", "AbortError");
    if (typeof body?.text !== "string" || !body.text.trim()) return json(400, "AI400_1", null, "교정할 문장을 입력해 주세요.");
    if (body.text.length > 1000) return json(400, "AI400_2", null, "원문은 1,000자 이내로 입력해 주세요.");
    if (typeof body.style !== "string" || !Object.prototype.hasOwnProperty.call(frames, body.style)) return json(400, "AI400_3", null, "지원하지 않는 스타일입니다.");
    if (plan !== "PRO") return json(403, "AI403_1", null, "AI 톤 교정은 Pro 플랜에서 이용할 수 있어요.");
    if (Date.now() >= Date.parse(resetAt)) { usedCount = 0; resetAt = nextReset(); }
    if (usedCount >= limit) return json(429, "AI429_1", null, "오늘의 교정 횟수를 모두 사용했어요.");
    const style = body.style as ToneStyle;
    const [opening, closing] = frames[style];
    usedCount += 1;
    return json(200, "AI200_1", {
      correctedText: `${opening}\n${body.text}\n${closing}`,
      style,
      keyInfoWarning: null,
      usage: { usedCount, limit, remaining: limit - usedCount, resetAt },
    }, "테스트 교정 결과입니다. 실제 AI가 생성한 문장이 아닙니다.");
  };
}

export function installAiTestApi() {
  const originalFetch = window.fetch.bind(window);
  const testFetch = createAiTestApi();
  window.fetch = (input, init) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, window.location.origin);
    return url.origin === window.location.origin && url.pathname === path ? testFetch(input, init) : originalFetch(input, init);
  };
}
