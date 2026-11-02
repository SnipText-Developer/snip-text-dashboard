/** @jest-environment node */
import { runInThisContext } from "vm";
import { createAiTestApi } from "./ai";
import { testAccessToken } from "./templates";

// Jest 27 does not expose Node’s native Fetch globals in its test environment.
beforeAll(() => {
  for (const name of ["Request", "Response", "Headers", "DOMException"]) {
    Object.defineProperty(globalThis, name, { configurable: true, value: runInThisContext(name) });
  }
});

const call = (api: typeof fetch, body: unknown, token = testAccessToken) => api("/api/v1/ai/tone-corrections", {
  method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body),
});

test("preserves variables and numbers, returns usage and enforces the limit", async () => {
  const api = createAiTestApi({ limit: 1 });
  const input = { style: "SOFT_POLITE", text: "{{이름}}님, 300만 원을 {{날짜}}까지 전달드릴게요." };
  const response = await call(api, input);
  const data = await response.json();
  expect(response.status).toBe(200);
  expect(data.result.correctedText).toContain(input.text);
  expect(data.result.usage).toMatchObject({ usedCount: 1, limit: 1, remaining: 0 });
  expect(Date.parse(data.result.usage.resetAt)).toBeGreaterThan(Date.now());
  expect((await call(api, input)).status).toBe(429);
  expect((await call(createAiTestApi(), input)).status).toBe(200);
});

test.each([
  [{ style: "CASUAL", text: " " }, "AI400_1"],
  [{ style: "CASUAL", text: "가".repeat(1001) }, "AI400_2"],
  [{ style: "UNKNOWN", text: "원문" }, "AI400_3"],
])("rejects invalid input without consuming usage", async (input, code) => {
  const api = createAiTestApi({ limit: 1 });
  expect(await (await call(api, input)).json()).toMatchObject({ isSuccess: false, code, result: null });
  expect((await call(api, { style: "CASUAL", text: "원문" })).status).toBe(200);
});

test("enforces authentication and Pro access", async () => {
  const input = { style: "CASUAL", text: "원문" };
  expect((await call(createAiTestApi(), input, "invalid")).status).toBe(401);
  expect((await call(createAiTestApi({ plan: "FREE" }), input)).status).toBe(403);
});

test("rejects aborted requests", async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(createAiTestApi()("/api/v1/ai/tone-corrections", { signal: controller.signal })).rejects.toMatchObject({ name: "AbortError" });
});
