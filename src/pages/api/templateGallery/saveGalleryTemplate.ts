import { FetchError } from "models/errorType";

export interface SaveGalleryTemplateResult {
  templateId: number;
  title: string;
  shortcut: string;
  originalShortcut: string;
  shortcutChanged: boolean;
}

const saveGalleryTemplateErrorStatuses = {
  TEMPLATE403_1: 403,
  TEMPLATE409_2: 409,
  GALLERY404_1: 404,
} as const;

export type SaveGalleryTemplateErrorCode = keyof typeof saveGalleryTemplateErrorStatuses;

export type SaveGalleryTemplateResponse =
  | {
      isSuccess: true;
      code: "GALLERY201_1";
      message: string;
      result: SaveGalleryTemplateResult;
    }
  | {
      isSuccess: false;
      code: SaveGalleryTemplateErrorCode;
      message: string;
      result: null;
    };

/**
 * 갤러리 템플릿을 내 템플릿으로 복사 저장합니다. 호출할 때마다 새 템플릿을 생성합니다.
 * 한도 검사, 단축어 자동 번호 및 출처 기록은 서버에서 처리하며 원본과 동기화하지 않습니다.
 * 명세의 오류는 응답으로 반환하고 네트워크 오류와 명세 외 응답은 throw합니다.
 * 호출부에서 비로그인 사용자는 로그인으로 유도하고, TEMPLATE403_1은 한도 모달로 처리합니다.
 * 성공 후 갤러리에 머물며 사용량을 갱신하고 shortcutChanged에 따라 토스트를 표시합니다.
 */
const saveGalleryTemplate = async (
  accessToken: string,
  galleryTemplateId: number,
  signal?: AbortSignal
): Promise<SaveGalleryTemplateResponse> => {
  const response = await fetch(
    `/api/v1/gallery/templates/${encodeURIComponent(galleryTemplateId)}/save`,
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
    response.status === 201 &&
    data?.isSuccess === true &&
    data.code === "GALLERY201_1" &&
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
    Object.prototype.hasOwnProperty.call(saveGalleryTemplateErrorStatuses, data.code) &&
    saveGalleryTemplateErrorStatuses[data.code as SaveGalleryTemplateErrorCode] === response.status &&
    typeof data.message === "string" &&
    data.result === null
  ) {
    return data;
  }

  throw new FetchError(
    response.status,
    typeof data?.message === "string"
      ? data.message
      : response.statusText || "갤러리 템플릿 저장 응답을 처리할 수 없습니다.",
    typeof data?.code === "string" ? data.code : undefined
  );
};

export default saveGalleryTemplate;
