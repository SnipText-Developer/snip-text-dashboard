import useFetch from "customHooks/useFetch";
import { Template } from "models/template";

export type TemplateDetailErrorCode = "TEMPLATE404_1" | "TEMPLATE404_2";

export type TemplateDetailResponse =
  | {
      isSuccess: true;
      code: "TEMPLATE200_2";
      message: string;
      result: Template;
    }
  | {
      isSuccess: false;
      code: TemplateDetailErrorCode;
      message: string;
      result: null;
    };

/**
 * 미리보기 또는 편집 화면의 템플릿 상세를 조회합니다.
 * HTTP 오류는 error로 반환하며 FetchError의 status, code, message를 유지합니다.
 * 토큰이나 templateId가 변경되면 재조회하고 이전 요청은 취소합니다.
 */
const useTemplateDetail = (accessToken: string, templateId: number) => {
  return useFetch<TemplateDetailResponse | null>(
    `/api/v1/templates/${encodeURIComponent(templateId)}`,
    null,
    [accessToken, templateId],
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      enabled: Boolean(accessToken),
      redirectOnError: false,
    },
  );
};

export default useTemplateDetail;
