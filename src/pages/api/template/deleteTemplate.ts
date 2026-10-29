import { FetchError } from "models/errorType";

export interface DeleteTemplateResult {
  templateId: number;
  title: string;
  deletedAt: string;
  purgeAt: string;
}

export type DeleteTemplateErrorCode = "TEMPLATE404_1";

export type DeleteTemplateResponse =
  | {
      isSuccess: true;
      code: "TEMPLATE200_4";
      message: string;
      result: DeleteTemplateResult;
    }
  | {
      isSuccess: false;
      code: DeleteTemplateErrorCode;
      message: string;
      result: null;
    };

/**
 * 템플릿을 휴지통으로 옮깁니다 (소프트 삭제).
 * TEMPLATE404_1은 응답으로 반환하고 네트워크 오류와 명세 외 응답은 throw합니다.
 * 성공 후 호출부에서 목록 및 사용량 API를 재조회하여 화면과 사이드바를 갱신합니다.
 * 단축어 점유 해제와 활성 개수 감소는 서버에서 처리합니다.
 */
const deleteTemplate = async (
  accessToken: string,
  templateId: number,
  signal?: AbortSignal
): Promise<DeleteTemplateResponse> => {
  const response = await fetch(
    `/api/v1/templates/${encodeURIComponent(templateId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal,
    }
  );

  const data = await response.json().catch(() => null);
  const result = data?.result;

  if (
    response.status === 200 &&
    data?.isSuccess === true &&
    data.code === "TEMPLATE200_4" &&
    typeof data.message === "string" &&
    typeof result?.templateId === "number" &&
    typeof result?.title === "string" &&
    typeof result?.deletedAt === "string" &&
    typeof result?.purgeAt === "string"
  ) {
    return data;
  }

  if (
    response.status === 404 &&
    data?.isSuccess === false &&
    data.code === "TEMPLATE404_1" &&
    typeof data.message === "string" &&
    data.result === null
  ) {
    return data;
  }

  throw new FetchError(
    response.status,
    typeof data?.message === "string"
      ? data.message
      : response.statusText || "템플릿 삭제 응답을 처리할 수 없습니다.",
    typeof data?.code === "string" ? data.code : undefined
  );
};

export default deleteTemplate;
