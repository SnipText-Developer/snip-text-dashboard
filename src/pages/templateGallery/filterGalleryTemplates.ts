import { GalleryCategoryFilter, GalleryTemplate } from "./types";

export const galleryCategoryTabs: {
  value: GalleryCategoryFilter;
  label: string;
}[] = [
  { value: "ALL", label: "전체" },
  { value: "WORK", label: "업무" },
  { value: "SALES", label: "영업" },
  { value: "CUSTOMER_SERVICE", label: "고객 응대" },
  { value: "PERSONAL", label: "개인" },
];

/**
 * 목록을 카테고리 탭 순서대로 섹션으로 묶습니다. 템플릿이 없는 카테고리는 제외합니다.
 */
export const groupGalleryTemplatesByCategory = (
  templates: GalleryTemplate[]
) => {
  return galleryCategoryTabs
    .filter((tab) => tab.value !== "ALL")
    .map((tab) => ({
      category: tab.value,
      label: tab.label,
      templates: templates.filter(
        (template) => template.category === tab.value
      ),
    }))
    .filter((group) => group.templates.length > 0);
};

/**
 * 카테고리와 검색어를 AND 조건으로 적용합니다. (GAL-01, GAL-02)
 * 검색 범위는 제목·본문·단축어이며 앞뒤 공백과 대소문자를 무시합니다.
 */
export const filterGalleryTemplates = (
  templates: GalleryTemplate[],
  category: GalleryCategoryFilter,
  searchQuery: string
) => {
  const keyword = searchQuery.trim().toLowerCase();

  return templates.filter(
    (template) =>
      (category === "ALL" || template.category === category) &&
      (!keyword ||
        [template.title, template.content, template.shortcut].some((value) =>
          value.toLowerCase().includes(keyword)
        ))
  );
};
