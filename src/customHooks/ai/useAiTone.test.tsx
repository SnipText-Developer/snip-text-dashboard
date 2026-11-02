import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import correctTone from "api/ai/correctTone";
import createTemplate from "api/template/createTemplate";
import useAiTone from "./useAiTone";

jest.mock("api/ai/correctTone");
jest.mock("api/template/createTemplate");
const correctMock = correctTone as jest.MockedFunction<typeof correctTone>;
const saveMock = createTemplate as jest.MockedFunction<typeof createTemplate>;
let root: Root;
let container: HTMLDivElement;
let page: ReturnType<typeof useAiTone>;
function Harness() { page = useAiTone("token"); return null; }
beforeEach(async () => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  jest.resetAllMocks();
  container = document.createElement("div");
  root = createRoot(container);
  await act(async () => root.render(<Harness />));
});
afterEach(async () => { await act(async () => root.unmount()); delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT; });
const result = {
  correctedText: "안녕하세요, {{이름}}님.", style: "SOFT_POLITE" as const,
  keyInfoWarning: { message: "핵심 정보를 확인해 주세요.", missingValues: ["날짜"], addedValues: [] },
  usage: { usedCount: 1, limit: 10, remaining: 9, resetAt: "2026-11-03T00:00:00+09:00" },
};
test("sends original text and selected style, preserving warning and usage", async () => {
  correctMock.mockResolvedValue({ isSuccess: true, code: "AI200_1", message: "성공", result });
  await act(async () => { page.setText(" 원문 {{이름}}\n"); page.setStyle("NOTICE"); });
  await act(async () => { await page.correct(); });
  expect(correctMock).toHaveBeenCalledWith("token", { text: " 원문 {{이름}}\n", style: "NOTICE" }, expect.any(AbortSignal));
  expect(page.result).toEqual(result);
  await act(async () => page.reset());
  expect(page.text).toBe("");
  expect(page.result).toBeNull();
});
test("blocks duplicate requests and displays server errors without retry", async () => {
  let resolve!: (value: Awaited<ReturnType<typeof correctTone>>) => void;
  correctMock.mockReturnValue(new Promise(done => { resolve = done; }));
  await act(async () => page.setText("원문"));
  let request!: Promise<void>;
  await act(async () => { request = page.correct(); await page.correct(); });
  expect(correctMock).toHaveBeenCalledTimes(1);
  expect(page.busy).toBe(true);
  await act(async () => { resolve({ isSuccess: false, code: "AI429_1", message: "교정 한도를 초과했어요.", result: null }); await request; });
  expect(page.error).toBe("교정 한도를 초과했어요.");
  expect(page.busy).toBe(false);
});
test("keeps the editor open when saving fails", async () => {
  saveMock.mockResolvedValue({ isSuccess: false, code: "TEMPLATE409_1", message: "중복 단축어", result: null });
  await act(async () => page.setEditing(true));
  await act(async () => page.save({ templateId: null, title: "제목", shortcut: "인사", content: result.correctedText }));
  expect(saveMock).toHaveBeenCalledWith("token", { title: "제목", shortcut: "/인사", content: result.correctedText });
  expect(page.editing).toBe(true);
  expect(page.notice).toBe("중복 단축어");
});
