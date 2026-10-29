import { FetchError } from "models/errorType";

export interface MyInfoResult {
  userId: number;
  nickname: string;
  email: string;
  profileImageUrl: string | null;
  loginType: "GOOGLE";
  templateSort: "RECENT_USED" | "RECENT_EDITED";
}

export type GetMyInfoErrorCode = "USER404_1";

export type GetMyInfoResponse =
  | {
      isSuccess: true;
      code: "USER200_1";
      message: string;
      result: MyInfoResult;
    }
  | {
      isSuccess: false;
      code: GetMyInfoErrorCode;
      message: string;
      result: null;
    };

/**
 * 사이드바 프로필·계정 정보 및 저장된 템플릿 정렬 기준을 조회합니다.
 * USER404_1은 응답으로 반환하며 네트워크 오류와 명세 외 응답은 throw합니다.
 * 프로필 이미지가 null이면 호출 화면에서 닉네임 첫 글자 아바타를 표시합니다.
 * 플랜·사용량은 별도 사용량 API에서 조회합니다.
 */
const getMyInfo = async (
  accessToken: string,
  signal?: AbortSignal
): Promise<GetMyInfoResponse> => {
  const response = await fetch("/api/v1/users/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal,
  });

  const data = await response.json().catch(() => null);
  const result = data?.result;

  if (
    response.status === 200 &&
    data?.isSuccess === true &&
    data.code === "USER200_1" &&
    typeof data.message === "string" &&
    typeof result?.userId === "number" &&
    typeof result?.nickname === "string" &&
    typeof result?.email === "string" &&
    (typeof result?.profileImageUrl === "string" || result?.profileImageUrl === null) &&
    result?.loginType === "GOOGLE" &&
    (result?.templateSort === "RECENT_USED" || result?.templateSort === "RECENT_EDITED")
  ) {
    return data;
  }

  if (
    response.status === 404 &&
    data?.isSuccess === false &&
    data.code === "USER404_1" &&
    typeof data.message === "string" &&
    data.result === null
  ) {
    return data;
  }

  throw new FetchError(
    response.status,
    typeof data?.message === "string"
      ? data.message
      : response.statusText || "내 정보 조회 응답을 처리할 수 없습니다.",
    typeof data?.code === "string" ? data.code : undefined
  );
};

export default getMyInfo;
