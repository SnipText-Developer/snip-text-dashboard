import { FetchError } from "models/errorType";

export interface EmptyTrashResult {
  deletedCount: number;
}

export interface EmptyTrashResponse {
  isSuccess: true;
  code: "TRASH200_4";
  message: string;
  result: EmptyTrashResult;
}

/**
 * 휴지통의 템플릿을 모두 영구 삭제합니다. 삭제 후 복구할 수 없습니다.
 * deletedCount가 0이어도 정상 성공입니다.
 * 공통 HTTP 오류와 명세 외 응답은 FetchError로, 네트워크 오류는 그대로 throw합니다.
 * 성공 후 호출부에서 휴지통 목록과 전체 개수를 비우고 빈 화면으로 전환합니다.
 */
const emptyTrash = async (
  accessToken: string,
  signal?: AbortSignal
): Promise<EmptyTrashResponse> => {
  const response = await fetch("/api/v1/trash/templates", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal,
  });

  const data = await response.json().catch(() => null);

  if (
    response.status === 200 &&
    data?.isSuccess === true &&
    data.code === "TRASH200_4" &&
    typeof data.message === "string" &&
    Number.isInteger(data.result?.deletedCount) &&
    data.result.deletedCount >= 0
  ) {
    return data;
  }

  throw new FetchError(
    response.status,
    typeof data?.message === "string"
      ? data.message
      : response.statusText || "휴지통 비우기 응답을 처리할 수 없습니다.",
    typeof data?.code === "string" ? data.code : undefined
  );
};

export default emptyTrash;
