import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import saveGalleryTemplate from "api/templateGallery/saveGalleryTemplate";
import useTemplateGalleryPage from "./useTemplateGalleryPage";
import { GalleryTemplate } from "../types";

let mockAccessToken = "token";
jest.mock("react-router-dom", () => ({ useOutletContext: () => ({ accessToken: mockAccessToken }) }), { virtual: true });
jest.mock("api/templateGallery/saveGalleryTemplate", () => ({ __esModule: true, default: jest.fn() }));
let mockTemplates: { data: unknown; error: Error | null; refetch: jest.Mock };
jest.mock("customHooks/template/useTemplates", () => ({ __esModule: true, default: () => mockTemplates }));

const save = saveGalleryTemplate as jest.Mock;
const template: GalleryTemplate = { galleryTemplateId: 3, category: "SALES", categoryName: "영업", title: "견적", shortcut: "/견적", content: "내용", variables: [] };
const saved = { templateId: 9, title: "견적", shortcut: "/견적", originalShortcut: "/견적", shortcutChanged: false };

let root: Root;
let page: ReturnType<typeof useTemplateGalleryPage>;
function Probe() { page = useTemplateGalleryPage(); return null; }
const add = () => act(async () => { await page.onAddToMyTemplates(template); });
const rerender = () => act(async () => root.render(<Probe />));
const myTemplates = (contents: string[]) => ({ isSuccess: true, result: { templates: contents.map((content) => ({ content })) } });

beforeEach(async () => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  mockAccessToken = "token";
  mockTemplates = { data: myTemplates(["다른 내용"]), error: null, refetch: jest.fn() };
  save.mockReset();
  root = createRoot(document.createElement("div"));
  await act(async () => root.render(<Probe />));
});
afterEach(async () => { await act(async () => root.unmount()); });
afterAll(() => { delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT; });

describe("copy", () => {
  const writeText = jest.fn();
  const withVariables: GalleryTemplate = { ...template, content: "{{고객명}}님", variables: ["고객명"] };

  beforeEach(() => {
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  });

  test("copies right away when there are no variables, without saving or logging in", async () => {
    mockAccessToken = "";
    await rerender();
    await act(async () => { page.onCopy(template); });
    expect(writeText).toHaveBeenCalledWith("내용");
    expect(page.copyingTemplate).toBeNull();
    expect(page.noticeProps.message).toBe("‘견적’ 내용을 복사했어요.");
    expect(save).not.toHaveBeenCalled();
  });

  test("opens the variable dialog and copies the filled content", async () => {
    await act(async () => { page.onCopy(withVariables); });
    expect(writeText).not.toHaveBeenCalled();
    expect(page.copyingTemplate).toBe(withVariables);

    await act(async () => { await page.copyDialogProps.onCopy("홍길동님"); });
    expect(writeText).toHaveBeenCalledWith("홍길동님");
    expect(save).not.toHaveBeenCalled();

    await act(async () => { page.copyDialogProps.onClose(); });
    expect(page.copyingTemplate).toBeNull();
  });

  test("reports clipboard failures", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    await act(async () => { page.onCopy(template); });
    expect(page.noticeProps.message).toBe("복사하지 못했어요. 브라우저의 클립보드 권한을 확인해 주세요.");
  });
});

test("saves the gallery template and shows a notice", async () => {
  save.mockResolvedValue({ isSuccess: true, result: saved });
  await add();
  expect(save).toHaveBeenCalledWith("token", 3);
  expect(page.noticeProps.message).toBe("‘견적’ 템플릿을 내 템플릿에 추가했어요.");
  expect(page.saving).toBe(false);
});

test("tells the user when the server renumbered the shortcut", async () => {
  save.mockResolvedValue({ isSuccess: true, result: { ...saved, shortcut: "/견적2", shortcutChanged: true } });
  await add();
  expect(page.noticeProps.message).toContain("/견적 대신 /견적2");
});

test("shows the server message for spec errors and thrown errors", async () => {
  save.mockResolvedValue({ isSuccess: false, code: "TEMPLATE403_1", message: "한도 초과", result: null });
  await add();
  expect(page.noticeProps.message).toBe("한도 초과");

  save.mockRejectedValue(new Error("네트워크 오류"));
  await add();
  expect(page.noticeProps.message).toBe("네트워크 오류");
  expect(page.saving).toBe(false);
});

test("does not save a template that is already in my templates", async () => {
  mockTemplates = { ...mockTemplates, data: myTemplates(["내용"]) };
  await rerender();
  await add();
  expect(save).not.toHaveBeenCalled();
  expect(page.noticeProps.message).toBe("이미 추가한 템플릿입니다.");
});

test("does not save the same template twice before the list is refreshed", async () => {
  save.mockResolvedValue({ isSuccess: true, result: saved });
  await add();
  await add();
  expect(save).toHaveBeenCalledTimes(1);
  expect(page.noticeProps.message).toBe("이미 추가한 템플릿입니다.");
});

test("retries after a failed save", async () => {
  save.mockRejectedValueOnce(new Error("네트워크 오류"));
  save.mockResolvedValue({ isSuccess: true, result: saved });
  await add();
  await add();
  expect(save).toHaveBeenCalledTimes(2);
  expect(page.noticeProps.message).toBe("‘견적’ 템플릿을 내 템플릿에 추가했어요.");
});

test("does not save while my templates are loading or failed to load", async () => {
  mockTemplates = { ...mockTemplates, data: null };
  await rerender();
  await add();
  expect(page.noticeProps.message).toBe("내 템플릿을 확인하고 있어요. 잠시 후 다시 시도해 주세요.");

  mockTemplates = { ...mockTemplates, error: new Error("조회 실패") };
  await rerender();
  await add();
  expect(page.noticeProps.message).toBe("내 템플릿을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.");
  expect(mockTemplates.refetch).toHaveBeenCalledTimes(1);
  expect(save).not.toHaveBeenCalled();
});

test("does not call the API without a login or while saving", async () => {
  let resolve: (value: unknown) => void = () => {};
  save.mockReturnValue(new Promise((done) => { resolve = done; }));
  await act(async () => { void page.onAddToMyTemplates(template); });
  expect(page.saving).toBe(true);
  await add();
  expect(save).toHaveBeenCalledTimes(1);
  await act(async () => resolve({ isSuccess: true, result: saved }));

  save.mockClear();
  mockAccessToken = "";
  await act(async () => root.render(<Probe />));
  await add();
  expect(save).not.toHaveBeenCalled();
  expect(page.noticeProps.message).toBe("로그인 후 내 템플릿에 추가할 수 있어요.");
});
