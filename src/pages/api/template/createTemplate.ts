import { FetchError } from "models/errorType";
import { Template } from "models/template";

export interface CreateTemplateRequest {
  title: string;
  shortcut: string;
  content: string;
}

const createTemplateErrorStatuses = {
  TEMPLATE400_1: 400,
  TEMPLATE400_2: 400,
  TEMPLATE400_3: 400,
  TEMPLATE400_4: 400,
  TEMPLATE400_5: 400,
  TEMPLATE400_6: 400,
  TEMPLATE400_7: 400,
  TEMPLATE403_1: 403,
  TEMPLATE409_1: 409,
} as const;

export type CreateTemplateErrorCode = keyof typeof createTemplateErrorStatuses;

export type CreateTemplateResponse =
  | {
      isSuccess: true;
      code: "TEMPLATE201_1";
      message: string;
      result: Template;
    }
  | {
      isSuccess: false;
      code: CreateTemplateErrorCode;
      message: string;
      result: null;
    };

/**
 * 새 템플릿을 저장합니다. 명세의 오류 응답도 그대로 반환하므로
 * 호출부에서 code에 따라 필드 포커스 또는 한도 모달을 처리합니다.
 * 네트워크 오류와 명세 외 HTTP 오류는 throw합니다.
 * 검증 순서, 예약어, 중복 및 저장 한도는 서버에서 판정합니다.
 */
const createTemplate = async (
  accessToken: string,
  input: CreateTemplateRequest,
  signal?: AbortSignal
): Promise<CreateTemplateResponse> => {
  const response = await fetch("/api/v1/templates", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal,
    body: JSON.stringify({
      title: input.title.trim(),
      shortcut: input.shortcut,
      content: input.content.replace(/\r\n?/g, "\n"),
    }),
  });

  const data = await response.json().catch(() => null);

  if (
    response.status === 201 &&
    data?.isSuccess === true &&
    data.code === "TEMPLATE201_1" &&
    typeof data.message === "string" &&
    data.result != null
  ) {
    return data;
  }

  if (
    !response.ok &&
    data?.isSuccess === false &&
    Object.prototype.hasOwnProperty.call(createTemplateErrorStatuses, data.code) &&
    createTemplateErrorStatuses[data.code as CreateTemplateErrorCode] === response.status &&
    typeof data.message === "string" &&
    data.result === null
  ) {
    return data;
  }

  throw new FetchError(
    response.status,
    typeof data?.message === "string"
      ? data.message
      : response.statusText || "템플릿 저장 응답을 처리할 수 없습니다.",
    typeof data?.code === "string" ? data.code : undefined
  );
};

export default createTemplate;
