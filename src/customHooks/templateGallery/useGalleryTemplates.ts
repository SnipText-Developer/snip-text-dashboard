import useFetch from "customHooks/useFetch";

export type GalleryTemplateCategory =
  | "WORK"
  | "SALES"
  | "CUSTOMER_SERVICE"
  | "PERSONAL";

export interface GalleryTemplate {
  galleryTemplateId: number;
  category: GalleryTemplateCategory;
  categoryName: string;
  title: string;
  shortcut: string;
  content: string;
  variables: string[];
}

export interface GalleryTemplatesResult {
  totalCount: number;
  templates: GalleryTemplate[];
}

export interface GalleryTemplatesResponse {
  isSuccess: true;
  code: "GALLERY200_2";
  message: string;
  result: GalleryTemplatesResult;
}

/**
 * 로그인 없이 갤러리 전체 목록을 서버 노출 순서대로 조회합니다.
 * enabled로 통합 검색 시점까지 요청을 지연할 수 있습니다.
 * 카테고리 필터·개수 및 검색은 호출 화면에서 처리합니다.
 * 캐시 수명은 서버의 Cache-Control: public, max-age=300 응답 헤더를 따릅니다.
 * 공통 HTTP 오류는 error에 FetchError로 반환합니다.
 */
const useGalleryTemplates = (enabled: boolean = true) => {
  return useFetch<GalleryTemplatesResponse | null>(
    "/api/v1/gallery/templates",
    null,
    [enabled],
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "omit",
      cache: "default",
      enabled,
      redirectOnError: false,
    }
  );
};

export default useGalleryTemplates;
