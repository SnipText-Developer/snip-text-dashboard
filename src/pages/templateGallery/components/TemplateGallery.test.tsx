import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import TemplateGallery from "./TemplateGallery";
import { filterGalleryTemplates, groupGalleryTemplatesByCategory } from "../filterGalleryTemplates";
import { GalleryTemplate } from "../types";

const templates: GalleryTemplate[] = [
  { galleryTemplateId: 1, category: "SALES", categoryName: "영업", title: "프로젝트 견적 안내", shortcut: "/견적", content: "안녕하세요, {{고객명}}님.", variables: ["고객명"] },
  { galleryTemplateId: 2, category: "WORK", categoryName: "업무", title: "Meeting 요청", shortcut: "/미팅", content: "회의 일정을 잡고 싶습니다.", variables: [] },
  { galleryTemplateId: 3, category: "SALES", categoryName: "영업", title: "재방문 감사", shortcut: "/감사", content: "방문해주셔서 감사합니다.", variables: [] },
];

let root: Root;
let container: HTMLDivElement;

const click = async (element: Element) => act(async () => { element.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
const texts = (selector: string) => Array.from(container.querySelectorAll(selector)).map((node) => node.textContent);
const render = (props: Partial<React.ComponentProps<typeof TemplateGallery>> = {}) =>
  act(async () => root.render(<TemplateGallery templates={templates} onCopy={jest.fn()} onAddToMyTemplates={jest.fn()} {...props} />));
const typeSearch = async (value: string) => {
  const input = container.querySelector<HTMLInputElement>(".template-gallery__search-input")!;
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  await act(async () => { setValue.call(input, value); input.dispatchEvent(new Event("input", { bubbles: true })); });
};

beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });
afterAll(() => { delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT; });

test("filters by category and search keyword together", () => {
  expect(filterGalleryTemplates(templates, "ALL", "  meeting ").map((t) => t.galleryTemplateId)).toEqual([2]);
  expect(filterGalleryTemplates(templates, "SALES", "견적").map((t) => t.galleryTemplateId)).toEqual([1]);
  expect(filterGalleryTemplates(templates, "WORK", "견적")).toEqual([]);
  expect(groupGalleryTemplatesByCategory(templates).map((g) => [g.label, g.templates.length])).toEqual([["업무", 1], ["영업", 2]]);
});

test("groups cards into category sections and shows content as preview", async () => {
  await render();
  expect(texts(".template-gallery__section-title")).toEqual(["업무", "영업"]);
  expect(texts(".gallery-card__content")).toContain("안녕하세요, {{고객명}}님.");

  await click(container.querySelectorAll(".template-gallery__tab")[2]);
  expect(texts(".template-gallery__section-title")).toEqual(["영업"]);
  expect(texts('.template-gallery__tab[aria-pressed="true"]')).toEqual(["영업"]);

  await typeSearch("감사");
  expect(texts(".gallery-card__title")).toEqual(["재방문 감사"]);

  await typeSearch("없는 검색어");
  expect(container.querySelector(".template-gallery__empty-title")?.textContent).toBe("검색된 템플릿이 없어요");
});

test("detail view swaps templates, emits handlers and returns to the list", async () => {
  const onCopy = jest.fn();
  const onAddToMyTemplates = jest.fn();
  await render({ onCopy, onAddToMyTemplates });

  await click(container.querySelector(".gallery-card__detail-button")!);
  expect(container.querySelector(".template-gallery__toolbar")).toBeNull();
  expect(container.querySelector(".gallery-detail__title")?.textContent).toBe("Meeting 요청");
  expect(container.querySelector(".gallery-detail__variables")).toBeNull();
  expect(document.activeElement).toBe(container.querySelector(".gallery-detail__title"));

  // 왼쪽 목록에서 템플릿을 바꿀 때는 제목으로 포커스를 다시 옮기지 않습니다.
  (document.activeElement as HTMLElement).blur();
  const sideCards = container.querySelectorAll(".gallery-card--compact");
  await click(sideCards[0]);
  expect(document.activeElement).toBe(document.body);
  expect(container.querySelector(".gallery-detail__title")?.textContent).toBe("프로젝트 견적 안내");
  expect(texts(".gallery-detail__variable")).toEqual(["{{고객명}}"]);
  expect(container.querySelector(".gallery-card--compact.is-selected .gallery-card__title")?.textContent).toBe("프로젝트 견적 안내");

  const [copyButton, addButton] = Array.from(container.querySelectorAll(".gallery-detail__button"));
  await click(copyButton);
  await click(addButton);
  expect(onCopy).toHaveBeenCalledWith(templates[0]);
  expect(onAddToMyTemplates).toHaveBeenCalledWith(templates[0]);

  await click(container.querySelector(".gallery-detail__back")!);
  expect(container.querySelector(".gallery-detail")).toBeNull();
  expect(container.querySelector(".template-gallery__toolbar")).not.toBeNull();
  // 목록으로 돌아오면 마지막으로 본 템플릿 카드의 "상세 보기" 버튼으로 포커스가 돌아옵니다.
  expect(document.activeElement?.getAttribute("aria-label")).toBe("프로젝트 견적 안내 상세 보기");
});
