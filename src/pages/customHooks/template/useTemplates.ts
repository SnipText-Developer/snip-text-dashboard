import useFetch from "customHooks/useFetch";
import { Template } from "models/template";

export type TemplateSort = "RECENT_USED" | "RECENT_EDITED";

export interface TemplatesResult {
  sort: TemplateSort;
  totalCount: number;
  templates: Template[];
}

/** 지원하지 않는 정렬 기준 (HTTP 400). */
export type TemplatesErrorCode = "TEMPLATE400_8";

export type TemplatesResponse =
  | {
      isSuccess: true;
      code: "TEMPLATE200_1";
      message: string;
      result: TemplatesResult;
    }
  | {
      isSuccess: false;
      code: TemplatesErrorCode;
      message: string;
      result: null;
    };

const useTemplates = (accessToken: string, sort?: TemplateSort) => {
  const url = sort
    ? `/api/v1/templates?sort=${encodeURIComponent(sort)}`
    : "/api/v1/templates";

  return useFetch<TemplatesResponse | null>(url, null, [accessToken, sort], {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    enabled: Boolean(accessToken),
    redirectOnError: false,
  });
};

export default useTemplates;
