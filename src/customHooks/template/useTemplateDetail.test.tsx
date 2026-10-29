import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import useTemplateDetail from "./useTemplateDetail";

const fetchMock = jest.fn();
const originalFetch = global.fetch;
let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  global.fetch = fetchMock;
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ isSuccess: true, result: { plan: "PRO" } }) });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });
afterAll(() => { global.fetch = originalFetch; delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT; });

test("template ID changes refetch and cancel previous requests", async () => {
  function Probe({ id }: { id: number }) { useTemplateDetail("token", id); return null; }
  await act(async () => root.render(<Probe id={12} />));
  const signal = fetchMock.mock.calls[0][1].signal;
  await act(async () => root.render(<Probe id={18} />));
  expect(signal.aborted).toBe(true);
  expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(["/api/v1/templates/12", "/api/v1/templates/18"]);
});

test.each(["TEMPLATE404_1", "TEMPLATE404_2"])("detail preserves %s error", async (code) => {
  fetchMock.mockResolvedValue({ ok: false, status: 404, json: async () => ({ code, message: "삭제됨" }) });
  let result: ReturnType<typeof useTemplateDetail>;
  function Probe() { result = useTemplateDetail("token", 12); return null; }
  await act(async () => root.render(<Probe />));
  expect(result!.error).toMatchObject({ status: 404, code, message: "삭제됨" });
});
