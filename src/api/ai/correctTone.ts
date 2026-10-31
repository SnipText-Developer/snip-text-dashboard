import { FetchError } from "models/errorType";

const toneStyles = [
  "BOSS_EXTERNAL", "REPORT_OFFICIAL", "MARKETING", "NOTICE",
  "SOFT_POLITE", "CASUAL", "ESSAY",
] as const;

export type ToneStyle = typeof toneStyles[number];

export interface CorrectToneRequest {
  style: ToneStyle;
  text: string;
}

export interface KeyInfoWarning {
  message: string;
  missingValues: string[];
  addedValues: string[];
}

export interface CorrectToneResult {
  correctedText: string;
  style: ToneStyle;
  keyInfoWarning: KeyInfoWarning | null;
  usage: {
    usedCount: number;
    limit: number;
    remaining: number;
    resetAt: string;
  };
}

const correctToneErrorStatuses = {
  AI400_1: 400,
  AI400_2: 400,
  AI400_3: 400,
  AI403_1: 403,
  AI422_1: 422,
  AI429_1: 429,
  AI502_1: 502,
  AI504_1: 504,
} as const;

export type CorrectToneErrorCode = keyof typeof correctToneErrorStatuses;

export type CorrectToneResponse =
  | { isSuccess: true; code: "AI200_1"; message: string; result: CorrectToneResult }
  | { isSuccess: false; code: CorrectToneErrorCode; message: string; result: null };

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

/**
 * AI 톤 교정을 실행합니다. 원문을 변형하지 않고 전송하며 원문·결과를 저장하거나 로그에 남기지 않습니다.
 * 핵심 정보 경고가 있어도 정상 성공입니다. 호출부는 경고 문구와 반환된 사용량을 표시합니다.
 * Pro 판정, 횟수 예약·반환, 핵심 정보 검사, 외부 AI의 20초 제한·출력 토큰 상한은 서버 책임입니다.
 * 자동 재시도하지 않습니다. signal 취소 시에도 이미 생성된 결과는 차감될 수 있습니다.
 * 명세의 오류는 응답으로 반환하고 네트워크 오류와 명세 외 응답은 throw합니다.
 * 이전 버전 이력은 호출 화면에서만 보관합니다.
 */
const correctTone = async (
  accessToken: string,
  input: CorrectToneRequest,
  signal?: AbortSignal
): Promise<CorrectToneResponse> => {
  const response = await fetch("/api/v1/ai/tone-corrections", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal,
    body: JSON.stringify({ style: input.style, text: input.text }),
  });

  const data = await response.json().catch(() => null);
  const result = data?.result;
  const warning = result?.keyInfoWarning;

  if (
    response.status === 200 &&
    data?.isSuccess === true && data.code === "AI200_1" &&
    typeof data.message === "string" &&
    typeof result?.correctedText === "string" &&
    toneStyles.includes(result?.style) &&
    (warning === null || (
      typeof warning?.message === "string" &&
      isStringArray(warning?.missingValues) && isStringArray(warning?.addedValues)
    )) &&
    Number.isInteger(result?.usage?.usedCount) &&
    Number.isInteger(result?.usage?.limit) &&
    Number.isInteger(result?.usage?.remaining) &&
    typeof result?.usage?.resetAt === "string"
  ) {
    return data;
  }

  if (
    !response.ok && data?.isSuccess === false &&
    Object.prototype.hasOwnProperty.call(correctToneErrorStatuses, data.code) &&
    correctToneErrorStatuses[data.code as CorrectToneErrorCode] === response.status &&
    typeof data.message === "string" && data.result === null
  ) {
    return data;
  }

  // 예상하지 못한 응답에 원문·교정문이 섞여 있어도 오류 메시지로 전파하지 않습니다.
  throw new FetchError(response.status, "톤 교정 응답을 처리할 수 없습니다.");
};

export default correctTone;
