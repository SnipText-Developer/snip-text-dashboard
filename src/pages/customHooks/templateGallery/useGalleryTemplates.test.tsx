import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import useGalleryTemplates from "./useGalleryTemplates";

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

test("waits until enabled, omits credentials and uses HTTP caching", async () => {
  function Probe({ enabled, id }: { enabled: boolean; id: number }) {
    useGalleryTemplates(enabled);
    return null;
  }
  await act(async () => root.render(<Probe enabled={false} id={3} />));
  expect(fetchMock).not.toHaveBeenCalled();
  await act(async () => root.render(<Probe enabled id={3} />));
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [url, options] = fetchMock.mock.calls[0];
  expect(url).toBe("/api/v1/gallery/templates");
  expect(options).toMatchObject({ credentials: "omit", cache: "default", headers: { "Content-Type": "application/json" } });
  expect(options.headers.Authorization).toBeUndefined();
  await act(async () => root.render(<Probe enabled id={4} />));
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
