import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import TemplatePreview from "./TemplatePreview";
import { Template } from "models/template";

let container: HTMLDivElement;
let root: Root;
const template: Template = { templateId: 1, title: "원래 제목", shortcut: "/안내", content: "안녕하세요 {{이름}}님", variables: ["이름"], lastUsedAt: null, createdAt: "", editedAt: "" };
const onSave = jest.fn();
beforeEach(async () => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  onSave.mockReset();
  await act(async () => root.render(<TemplatePreview template={template} saving={false} onClose={jest.fn()} onSave={onSave} onDelete={jest.fn()} onCopy={jest.fn()} />));
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT; });
async function changeTitle(value: string) {
  const input = container.querySelector("input")!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
function button(text: string) { return Array.from(container.querySelectorAll("button")).find(button => button.textContent === text)!; }
test("reset restores the saved values", async () => {
  await changeTitle("수정 제목");
  expect(button("저장").disabled).toBe(false);
  await act(async () => button("초기화").click());
  expect(container.querySelector("input")!.value).toBe(template.title);
  expect(button("저장").disabled).toBe(true);
});
test("failed saves keep the draft and successful saves establish a new reset value", async () => {
  onSave.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  await changeTitle("수정 제목");
  const submit = async () => { await act(async () => { container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); }); };
  await submit();
  expect(button("저장").disabled).toBe(false);
  expect(container.querySelector("input")!.value).toBe("수정 제목");
  await submit();
  expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({ templateId: 1, title: "수정 제목" }));
  expect(button("저장").disabled).toBe(true);
  await changeTitle("다른 제목");
  await act(async () => button("초기화").click());
  expect(container.querySelector("input")!.value).toBe("수정 제목");
});
