import { FetchError } from "models/errorType";

export interface PermanentlyDeleteTemplateResult {
  templateId: number;
}

export type PermanentlyDeleteTemplateErrorCode = "TRASH404_1";

export type PermanentlyDeleteTemplateResponse =
  | {
      isSuccess: true;
      code: "TRASH200_3";
      message: string;
      result: PermanentlyDeleteTemplateResult;
    }
  | {
      isSuccess: false;
      code: PermanentlyDeleteTemplateErrorCode;
      message: string;
      result: null;
    };

/**
 * 휴지통의 템플릿을 개별 영구 삭제합니다. 삭제 후 복구할 수 없습니다.
 * 소유권과 휴지통 여부는 서버에서 검증합니다.
 * TRASH404_1은 응답으로 반환하고 네트워크 오류와 명세 외 응답은 throw합니다.
 * 성공 후 호출부에서 휴지통 목록 및 전체 개수를 갱신합니다.
 */
const permanentlyDeleteTemplate = async (
  accessToken: string,
  templateId: number,
  signal?: AbortSignal
): Promise<PermanentlyDeleteTemplateResponse> => {
  const response = await fetch(
    `/api/v1/trash/templates/${encodeURIComponent(templateId)}`,
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

  if (
    response.status === 200 &&
    data?.isSuccess === true &&
    data.code === "TRASH200_3" &&
    typeof data.message === "string" &&
    typeof data.result?.templateId === "number"
  ) {
    return data;
  }

  if (
    response.status === 404 &&
    data?.isSuccess === false &&
    data.code === "TRASH404_1" &&
    typeof data.message === "string" &&
    data.result === null
  ) {
    return data;
  }

  throw new FetchError(
    response.status,
    typeof data?.message === "string"
      ? data.message
      : response.statusText || "템플릿 영구 삭제 응답을 처리할 수 없습니다.",
    typeof data?.code === "string" ? data.code : undefined
  );
};

export default permanentlyDeleteTemplate;
