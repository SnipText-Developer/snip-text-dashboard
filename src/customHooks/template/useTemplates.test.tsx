import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import useTemplates from "./useTemplates";

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

test("list waits for token and refetches on token and sort changes", async () => {
  function Probe({ token, sort }: { token: string; sort?: "RECENT_EDITED" }) { useTemplates(token, sort); return null; }
  await act(async () => root.render(<Probe token="" />));
  expect(fetchMock).not.toHaveBeenCalled();
  await act(async () => root.render(<Probe token="first" />));
  expect(fetchMock.mock.calls[0][0]).toBe("/api/v1/templates");
  await act(async () => root.render(<Probe token="second" sort="RECENT_EDITED" />));
  expect(fetchMock.mock.calls[1][0]).toBe("/api/v1/templates?sort=RECENT_EDITED");
  expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe("Bearer second");
});
