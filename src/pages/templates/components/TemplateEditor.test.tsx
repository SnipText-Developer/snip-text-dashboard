import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import TemplateEditor from "./TemplateEditor";

let container: HTMLDivElement;
let root: Root;
const onSave = jest.fn();
const onClose = jest.fn();
beforeEach(async () => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  onSave.mockReset();
  onClose.mockReset();
  await act(async () => root.render(<TemplateEditor initialDraft={{ templateId: null, title: "안내", shortcut: "/안내", content: "안녕하세요 고객님" }} saving={false} onClose={onClose} onSave={onSave} />));
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT; });
function button(text: string) { return Array.from(container.querySelectorAll("button")).find(button => button.textContent === text)!; }
test("preset variable replaces selected text and submits the resulting content", async () => {
  const textarea = container.querySelector("textarea")!;
  textarea.setSelectionRange(6, 8);
  await act(async () => button("{{이름}}").click());
  expect(textarea.value).toBe("안녕하세요 {{이름}}님");
  expect(document.activeElement).toBe(textarea);
  expect(textarea.selectionStart).toBe(12);
  await act(async () => { container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ templateId: null, content: "안녕하세요 {{이름}}님" }));
});
test("cancel returns without saving", async () => {
  await act(async () => button("취소").click());
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onSave).not.toHaveBeenCalled();
});
