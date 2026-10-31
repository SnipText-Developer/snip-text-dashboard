import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import useUserUsage from "./useUserUsage";

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

test("usage refetches and falls back to FREE after failure", async () => {
  let result: ReturnType<typeof useUserUsage>;
  function Probe() { result = useUserUsage("token"); return null; }
  await act(async () => root.render(<Probe />));
  expect(result!.plan).toBe("PRO");
  fetchMock.mockRejectedValue(new TypeError("offline"));
  await act(async () => result!.refetch());
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(result!.plan).toBe("FREE");
  expect(result!.usage).toBeNull();
  expect(result!.error).toBeInstanceOf(TypeError);
});

