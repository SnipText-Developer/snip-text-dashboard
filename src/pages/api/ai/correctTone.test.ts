import correctTone from "./correctTone";

const fetchMock = jest.fn();
const originalFetch = global.fetch;
const input = { style: "BOSS_EXTERNAL" as const, text: " 원문\n300만 원 " };
const usage = { usedCount: 4, limit: 10, remaining: 6, resetAt: "2026-10-12T00:00:00+09:00" };

beforeEach(() => { global.fetch = fetchMock; fetchMock.mockReset(); });
afterAll(() => { global.fetch = originalFetch; });

function respond(status: number, data: unknown) {
  fetchMock.mockResolvedValue({ status, ok: status < 400, json: async () => data });
}

test.each([
  null,
  { message: "정보를 확인해주세요.", missingValues: ["300만 원"], addedValues: [] },
])("returns success including key information warning %j", async (keyInfoWarning) => {
  const body = { isSuccess: true, code: "AI200_1", message: "성공", result: { correctedText: "교정문\n", style: input.style, keyInfoWarning, usage } };
  respond(200, body);
  const signal = new AbortController().signal;
  expect(await correctTone("token", input, signal)).toEqual(body);
  expect(fetchMock).toHaveBeenCalledWith("/api/v1/ai/tone-corrections", {
    method: "POST", headers: { Authorization: "Bearer token", "Content-Type": "application/json" },
    cache: "no-store", signal, body: JSON.stringify(input),
  });
});

test.each([
  [400, "AI400_1"], [400, "AI400_2"], [400, "AI400_3"], [403, "AI403_1"],
  [422, "AI422_1"], [429, "AI429_1"], [502, "AI502_1"], [504, "AI504_1"],
])("returns %s %s without retry", async (status, code) => {
  const body = { isSuccess: false, code, message: "실패", result: null };
  respond(status as number, body);
  expect(await correctTone("token", input)).toEqual(body);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test("does not propagate unexpected response text containing private content", async () => {
  respond(500, { message: input.text });
  await expect(correctTone("token", input)).rejects.toMatchObject({ status: 500, message: "톤 교정 응답을 처리할 수 없습니다." });
});

test("rejects malformed success response", async () => {
  respond(200, { isSuccess: true, code: "AI200_1", message: "성공", result: { correctedText: "교정", style: "UNKNOWN", keyInfoWarning: null, usage } });
  await expect(correctTone("token", input)).rejects.toMatchObject({ status: 200 });
});

test("preserves network and cancellation errors without retry", async () => {
  const error = new DOMException("Aborted", "AbortError");
  fetchMock.mockRejectedValue(error);
  await expect(correctTone("token", input)).rejects.toBe(error);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test("handles non-JSON error responses", async () => {
  fetchMock.mockResolvedValue({ status: 502, json: async () => { throw new SyntaxError(); } });
  await expect(correctTone("token", input)).rejects.toMatchObject({ status: 502 });
});
