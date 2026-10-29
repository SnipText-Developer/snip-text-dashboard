import { FetchError } from "models/errorType";

export interface RestoreTemplateResult {
  templateId: number;
  title: string;
  shortcut: string;
  originalShortcut: string;
  shortcutChanged: boolean;
}

const restoreTemplateErrorStatuses = {
  TEMPLATE403_1: 403,
  TEMPLATE409_2: 409,
  TRASH404_1: 404,
} as const;

export type RestoreTemplateErrorCode = keyof typeof restoreTemplateErrorStatuses;

export type RestoreTemplateResponse =
  | {
      isSuccess: true;
      code: "TRASH200_2";
      message: string;
      result: RestoreTemplateResult;
    }
  | {
      isSuccess: false;
      code: RestoreTemplateErrorCode;
      message: string;
      result: null;
    };

/**
 * 휴지통의 템플릿을 복구합니다. 명세의 오류는 응답으로 반환하며,
 * 네트워크 오류와 명세 외 응답은 throw합니다.
 * 한도 검사, 단축어 자동 번호 및 삭제 전 수정·사용 시각 보존은 서버에서 처리합니다.
 * 호출부에서 TEMPLATE403_1은 한도 모달로, shortcutChanged는 토스트 안내로 처리하고
 * 성공 후 내 템플릿·휴지통 목록 및 사용량을 갱신합니다.
 */
const restoreTemplate = async (
  accessToken: string,
  templateId: number,
  signal?: AbortSignal
): Promise<RestoreTemplateResponse> => {
  const response = await fetch(
    `/api/v1/trash/templates/${encodeURIComponent(templateId)}/restore`,
    {
      method: "POST",
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
    data.code === "TRASH200_2" &&
    typeof data.message === "string" &&
    typeof result?.templateId === "number" &&
    typeof result?.title === "string" &&
    typeof result?.shortcut === "string" &&
    typeof result?.originalShortcut === "string" &&
    typeof result?.shortcutChanged === "boolean"
  ) {
    return data;
  }

  if (
    !response.ok &&
    data?.isSuccess === false &&
    Object.prototype.hasOwnProperty.call(restoreTemplateErrorStatuses, data.code) &&
    restoreTemplateErrorStatuses[data.code as RestoreTemplateErrorCode] === response.status &&
    typeof data.message === "string" &&
    data.result === null
  ) {
    return data;
  }

  throw new FetchError(
    response.status,
    typeof data?.message === "string"
      ? data.message
      : response.statusText || "템플릿 복구 응답을 처리할 수 없습니다.",
    typeof data?.code === "string" ? data.code : undefined
  );
};

export default restoreTemplate;
