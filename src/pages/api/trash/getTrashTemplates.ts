import { FetchError } from "models/errorType";

export interface GetTrashTemplatesRequest {
  cursor?: string;
  /** 생략 시 서버 기본값 20, 허용 범위 1~50. */
  size?: number;
}

export interface TrashTemplate {
  templateId: number;
  title: string;
  shortcut: string;
  deletedAt: string;
  purgeAt: string;
}

export interface TrashTemplatesResult {
  totalCount: number;
  templates: TrashTemplate[];
  hasNext: boolean;
  nextCursor: string | null;
}

export type GetTrashTemplatesErrorCode = "TRASH400_1";

export type GetTrashTemplatesResponse =
  | {
      isSuccess: true;
      code: "TRASH200_1";
      message: string;
      result: TrashTemplatesResult;
    }
  | {
      isSuccess: false;
      code: GetTrashTemplatesErrorCode;
      message: string;
      result: null;
    };

/**
 * 최근 삭제순으로 휴지통 목록을 조회합니다.
 * 다음 페이지는 hasNext를 확인한 뒤 nextCursor를 cursor로 전달합니다.
 * 잘못된 페이지 요청은 TRASH400_1 응답으로 반환하며,
 * 네트워크 오류와 명세 외 응답은 throw합니다.
 */
const getTrashTemplates = async (
  accessToken: string,
  input: GetTrashTemplatesRequest = {},
  signal?: AbortSignal
): Promise<GetTrashTemplatesResponse> => {
  const query = new URLSearchParams();
  if (input.cursor !== undefined) query.set("cursor", input.cursor);
  if (input.size !== undefined) query.set("size", String(input.size));
  const queryString = query.toString();

  const response = await fetch(
    `/api/v1/trash/templates${queryString ? `?${queryString}` : ""}`,
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

  if (
    response.status === 200 &&
    data?.isSuccess === true &&
    data.code === "TRASH200_1" &&
    typeof data.message === "string" &&
    typeof result?.totalCount === "number" &&
    Array.isArray(result?.templates) &&
    result.templates.every(
      (template: TrashTemplate | null) =>
        typeof template?.templateId === "number" &&
        typeof template?.title === "string" &&
        typeof template?.shortcut === "string" &&
        typeof template?.deletedAt === "string" &&
        typeof template?.purgeAt === "string"
    ) &&
    typeof result?.hasNext === "boolean" &&
    (typeof result?.nextCursor === "string" || result?.nextCursor === null)
  ) {
    return data;
  }

  if (
    response.status === 400 &&
    data?.isSuccess === false &&
    data.code === "TRASH400_1" &&
    typeof data.message === "string" &&
    data.result === null
  ) {
    return data;
  }

  throw new FetchError(
    response.status,
    typeof data?.message === "string"
      ? data.message
      : response.statusText || "휴지통 조회 응답을 처리할 수 없습니다.",
    typeof data?.code === "string" ? data.code : undefined
  );
};

export default getTrashTemplates;
