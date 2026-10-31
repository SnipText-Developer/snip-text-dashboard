import useFetch from "customHooks/useFetch";
import type { GalleryTemplate } from "./useGalleryTemplates";

export type GalleryTemplateDetailErrorCode = "GALLERY404_1";

export type GalleryTemplateDetailResponse =
  | {
      isSuccess: true;
      code: "GALLERY200_3";
      message: string;
      result: GalleryTemplate;
    }
  | {
      isSuccess: false;
      code: GalleryTemplateDetailErrorCode;
      message: string;
      result: null;
    };

/**
 * 로그인 없이 갤러리 템플릿 상세를 조회합니다.
 * ID 또는 enabled 변경 시 이전 요청을 취소하고 조회 여부를 갱신합니다.
 * 캐시는 서버의 Cache-Control: public, max-age=300 응답 헤더를 따릅니다.
 * 없거나 비공개인 템플릿의 HTTP 404는 error에 FetchError로 반환합니다.
 * code: GALLERY404_1, message: "갤러리 템플릿을 찾을 수 없어요."
 */
const useGalleryTemplateDetail = (
  galleryTemplateId: number,
  enabled: boolean = true
) => {
  return useFetch<GalleryTemplateDetailResponse | null>(
    `/api/v1/gallery/templates/${encodeURIComponent(galleryTemplateId)}`,
    null,
    [galleryTemplateId, enabled],
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

export default useGalleryTemplateDetail;
