import { FetchError } from "models/errorType";
import type { MyInfoResult } from "./getMyInfo";

export interface UpdateUserSettingsRequest {
  templateSort: MyInfoResult["templateSort"];
}

export interface UpdateUserSettingsResult {
  templateSort: MyInfoResult["templateSort"];
}

export type UpdateUserSettingsErrorCode = "USER400_1";

export type UpdateUserSettingsResponse =
  | {
      isSuccess: true;
      code: "USER200_3";
      message: string;
      result: UpdateUserSettingsResult;
    }
  | {
      isSuccess: false;
      code: UpdateUserSettingsErrorCode;
      message: string;
      result: null;
    };

/**
 * 계정의 템플릿 정렬 기준을 저장합니다.
 * USER400_1은 응답으로 반환하며 네트워크 오류와 명세 외 응답은 throw합니다.
 * 호출부는 화면을 즉시 정렬한 뒤 백그라운드로 저장하고,
 * 실패 응답과 예외를 처리하되 사용자 알림이나 오류 리다이렉트는 하지 않습니다.
 */
const updateUserSettings = async (
  accessToken: string,
  input: UpdateUserSettingsRequest,
  signal?: AbortSignal
): Promise<UpdateUserSettingsResponse> => {
  const response = await fetch("/api/v1/users/me/settings", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal,
    body: JSON.stringify({ templateSort: input.templateSort }),
  });

  const data = await response.json().catch(() => null);

  if (
    response.status === 200 &&
    data?.isSuccess === true &&
    data.code === "USER200_3" &&
    typeof data.message === "string" &&
    (data.result?.templateSort === "RECENT_USED" ||
      data.result?.templateSort === "RECENT_EDITED")
  ) {
    return data;
  }

  if (
    response.status === 400 &&
    data?.isSuccess === false &&
    data.code === "USER400_1" &&
    typeof data.message === "string" &&
    data.result === null
  ) {
    return data;
  }

  throw new FetchError(
    response.status,
    typeof data?.message === "string"
      ? data.message
      : response.statusText || "설정 저장 응답을 처리할 수 없습니다.",
    typeof data?.code === "string" ? data.code : undefined
  );
};

export default updateUserSettings;
