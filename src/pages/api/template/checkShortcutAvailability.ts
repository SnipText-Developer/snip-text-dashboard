import { FetchError } from "models/errorType";

export interface CheckShortcutAvailabilityRequest {
  shortcut: string;
  excludeTemplateId?: number;
}

export type ShortcutUnavailableReason =
  | "INVALID_FORMAT"
  | "RESERVED"
  | "DUPLICATED";

export const shortcutUnavailableMessages: Record<ShortcutUnavailableReason, string> = {
  INVALID_FORMAT: "한글·영문·숫자 2~10자로 입력해주세요.",
  RESERVED: "사용할 수 없는 단축어예요.",
  DUPLICATED: "이미 사용 중인 단축어예요.",
};

export type ShortcutAvailabilityResult = { shortcut: string } & (
  | { available: true; reason: null }
  | { available: false; reason: ShortcutUnavailableReason }
);

export interface CheckShortcutAvailabilityResponse {
  isSuccess: true;
  code: "TEMPLATE200_5";
  message: string;
  result: ShortcutAvailabilityResult;
}

/**
 * 단축어 형식·예약어·중복 여부를 확인합니다. 사용 불가도 성공 응답으로 반환합니다.
 * 호출부에서 한글 조합 종료 후 500ms 디바운스를 적용하고,
 * 이전 요청은 signal로 취소합니다. 저장 시에는 서버가 다시 검증합니다.
 */
const checkShortcutAvailability = async (
  accessToken: string,
  input: CheckShortcutAvailabilityRequest,
  signal?: AbortSignal
): Promise<CheckShortcutAvailabilityResponse> => {
  const query = new URLSearchParams({ shortcut: input.shortcut });
  if (input.excludeTemplateId !== undefined) {
    query.set("excludeTemplateId", String(input.excludeTemplateId));
  }

  const response = await fetch(
    `/api/v1/templates/shortcuts/availability?${query.toString()}`,
    {
      method: "GET",
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
  const validAvailability =
    (result?.available === true && result.reason === null) ||
    (result?.available === false &&
      (result.reason === "INVALID_FORMAT" ||
        result.reason === "RESERVED" ||
        result.reason === "DUPLICATED"));

  if (
    response.status === 200 &&
    data?.isSuccess === true &&
    data.code === "TEMPLATE200_5" &&
    typeof data.message === "string" &&
    typeof result?.shortcut === "string" &&
    validAvailability
  ) {
    return data;
  }

  throw new FetchError(
    response.status,
    typeof data?.message === "string"
      ? data.message
      : response.statusText || "단축어 확인 응답을 처리할 수 없습니다.",
    typeof data?.code === "string" ? data.code : undefined
  );
};

export default checkShortcutAvailability;
