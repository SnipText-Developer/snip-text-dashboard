import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MemoryRouter, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import useTemplatesPage from "./useTemplatesPage";

jest.mock("react-router-dom", () => {
  global.TextEncoder = require("util").TextEncoder;
  return require(process.cwd() + "/node_modules/react-router/dist/development/index.js");
});
jest.mock("customHooks/template/useTemplates", () => ({ __esModule: true, default: () => ({ data: { isSuccess: true, result: { templates: [], totalCount: 0 } }, refetch: jest.fn() }) }));
jest.mock("customHooks/template/useTemplateDetail", () => ({ __esModule: true, default: () => ({ data: null, refetch: jest.fn() }) }));
let page: ReturnType<typeof useTemplatesPage>;
let root: Root;
let container: HTMLDivElement;
let navigate: ReturnType<typeof useNavigate>;
let pathname: string;
function Probe() { page = useTemplatesPage(); navigate = useNavigate(); pathname = useLocation().pathname; return null; }
async function setup(path = "/templates") {
  await act(async () => root.render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route element={<Outlet context={{ query: "", accessToken: "token" }} />}>
      <Route path="/templates" element={<Probe />} />
      <Route path="/templates/new" element={<Probe />} />
      <Route path="/templates/:templateId" element={<Probe />} />
      <Route path="/templates/:templateId/edit" element={<Probe />} />
    </Route>
  </Routes></MemoryRouter>));
}
beforeEach(() => { (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true; container = document.createElement("div"); root = createRoot(container); });
afterEach(async () => { await act(async () => root.unmount()); delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT; });
test("new and detail views follow browser back and forward", async () => {
  await setup();
  await act(async () => page.headerProps.onCreate());
  expect(pathname).toBe("/templates/new");
  expect(page.editing?.templateId).toBeNull();
  await act(async () => page.editorProps.onClose());
  expect(pathname).toBe("/templates");
  await act(async () => page.listProps.onSelect(12));
  expect(pathname).toBe("/templates/12");
  expect(page.previewVisible).toBe(true);
  await act(async () => navigate(-1));
  expect(page.previewVisible).toBe(false);
  await act(async () => navigate(1));
  expect(page.listProps.selectedId).toBe(12);
  await act(async () => page.previewProps.onClose());
  expect(pathname).toBe("/templates");
});
test("direct detail access closes to the list without leaving the app", async () => {
  await setup("/templates/12");
  await act(async () => page.previewProps.onClose());
  expect(pathname).toBe("/templates");
});
