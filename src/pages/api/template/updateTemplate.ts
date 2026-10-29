import { FetchError } from "models/errorType";
import { Template } from "models/template";

export interface UpdateTemplateRequest {
  title: string;
  shortcut: string;
  content: string;
}

const updateTemplateErrorStatuses = {
  TEMPLATE400_1: 400,
  TEMPLATE400_2: 400,
  TEMPLATE400_3: 400,
  TEMPLATE400_4: 400,
  TEMPLATE400_5: 400,
  TEMPLATE400_6: 400,
  TEMPLATE400_7: 400,
  TEMPLATE404_1: 404,
  TEMPLATE404_2: 404,
  TEMPLATE409_1: 409,
} as const;

export type UpdateTemplateErrorCode = keyof typeof updateTemplateErrorStatuses;

export type UpdateTemplateResponse =
  | {
      isSuccess: true;
      code: "TEMPLATE200_3";
      message: string;
      result: Template;
    }
  | {
      isSuccess: false;
      code: UpdateTemplateErrorCode;
      message: string;
      result: null;
    };

/**
 * 바뀌지 않은 필드를 포함하여 템플릿 전체를 수정합니다.
 * 명세의 오류는 응답으로 반환하고 네트워크 오류와 명세 외 응답은 throw합니다.
 * 권한, 휴지통 여부 및 자기 자신을 제외한 단축어 중복은 서버에서 판정합니다.
 * S2 확장 변경 알림은 성공 응답을 받은 호출부에서 처리합니다.
 */
const updateTemplate = async (
  accessToken: string,
  templateId: number,
  input: UpdateTemplateRequest,
  signal?: AbortSignal
): Promise<UpdateTemplateResponse> => {
  const response = await fetch(
    `/api/v1/templates/${encodeURIComponent(templateId)}`,
    {
      method: "PUT",
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
    }
  );

  const data = await response.json().catch(() => null);

  if (
    response.status === 200 &&
    data?.isSuccess === true &&
    data.code === "TEMPLATE200_3" &&
    typeof data.message === "string" &&
    data.result != null
  ) {
    return data;
  }

  if (
    !response.ok &&
    data?.isSuccess === false &&
    Object.prototype.hasOwnProperty.call(updateTemplateErrorStatuses, data.code) &&
    updateTemplateErrorStatuses[data.code as UpdateTemplateErrorCode] === response.status &&
    typeof data.message === "string" &&
    data.result === null
  ) {
    return data;
  }

  throw new FetchError(
    response.status,
    typeof data?.message === "string"
      ? data.message
      : response.statusText || "템플릿 수정 응답을 처리할 수 없습니다.",
    typeof data?.code === "string" ? data.code : undefined
  );
};

export default updateTemplate;
