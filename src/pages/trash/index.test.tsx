import { act } from "react";
import { createRoot } from "react-dom/client";

import emptyTrash from "api/trash/emptyTrash";
import getTrashTemplates from "api/trash/getTrashTemplates";
import permanentlyDeleteTemplate from "api/trash/permanentlyDeleteTemplate";
import restoreTemplate from "api/trash/restoreTemplate";
import TrashPage from ".";

jest.mock("react-router-dom", () => ({ useOutletContext: () => ({ accessToken: "token" }) }));
jest.mock("api/trash/emptyTrash");
jest.mock("api/trash/getTrashTemplates");
jest.mock("api/trash/permanentlyDeleteTemplate");
jest.mock("api/trash/restoreTemplate");

const template = {
  templateId: 3, title: "문의 답변 안내", shortcut: "/문의",
  deletedAt: "2026-11-13", purgeAt: "2026-12-13",
};

test.each([
  ["복구하기", "템플릿을 복구할까요?", restoreTemplate, ["token", 3],
    { isSuccess: true, result: { shortcutChanged: true, shortcut: "/문의2" } }, "단축어가 /문의2"],
  ["영구 삭제", "템플릿을 영구 삭제할까요?", permanentlyDeleteTemplate, ["token", 3],
    { isSuccess: true }, "템플릿을 영구 삭제했어요."],
  ["전체 영구 삭제", "템플릿 1개를 영구 삭제할까요?", emptyTrash, ["token"],
    { isSuccess: true, result: { deletedCount: 1 } }, "템플릿 1개를 영구 삭제했어요."],
] as const)("%s confirms the API operation and refreshes the list", async (label, title, api, args, response, notice) => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  const prototype = HTMLDialogElement.prototype;
  const show = Object.getOwnPropertyDescriptor(prototype, "showModal");
  const close = Object.getOwnPropertyDescriptor(prototype, "close");
  Object.defineProperty(prototype, "showModal", { configurable: true, value() {} });
  Object.defineProperty(prototype, "close", { configurable: true, value() {} });
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  const button = (text: string) => Array.from(container.querySelectorAll("button"))
    .find(element => element.textContent === text)!;
  const click = (element: HTMLElement) => act(async () => { element.click(); });

  try {
    const getList = jest.mocked(getTrashTemplates);
    getList.mockReset();
    getList.mockResolvedValueOnce({
      isSuccess: true, code: "TRASH200_1", message: "",
      result: { templates: [template], totalCount: 1, hasNext: false, nextCursor: null },
    }).mockResolvedValueOnce({
      isSuccess: true, code: "TRASH200_1", message: "",
      result: { templates: [], totalCount: 0, hasNext: false, nextCursor: null },
    });
    (api as jest.Mock).mockResolvedValue(response);
    await act(async () => root.render(<TrashPage />));
    expect(container.querySelector("tbody")?.textContent).toContain(template.title);

    if (label === "영구 삭제") await click(container.querySelector<HTMLButtonElement>(".trash-more")!);
    await click(button(label));
    expect(container.querySelector("dialog h2")?.textContent).toBe(title);
    expect(api).not.toHaveBeenCalled();
    await click(container.querySelector<HTMLButtonElement>('dialog button[type="submit"]')!);

    expect(api).toHaveBeenCalledWith(...args, expect.any(AbortSignal));
    expect(getList).toHaveBeenCalledTimes(2);
    expect(container.textContent).toContain("삭제 목록이 비어 있어요");
    expect(button("전체 영구 삭제").disabled).toBe(true);
    expect(document.body.querySelector('[role="status"]')?.textContent).toContain(notice);
  } finally {
    await act(async () => root.unmount());
    container.remove();
    if (show) Object.defineProperty(prototype, "showModal", show);
    else Reflect.deleteProperty(prototype, "showModal");
    if (close) Object.defineProperty(prototype, "close", close);
    else Reflect.deleteProperty(prototype, "close");
    delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
  }
});
