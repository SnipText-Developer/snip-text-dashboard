import { useCallback, useState } from "react";
import useFetch from "customHooks/useFetch";

export type UserPlan = "FREE" | "PRO";

export interface UserUsageResult {
  plan: UserPlan;
  template: {
    count: number;
    limit: number;
    remaining: number;
    isFull: boolean;
  };
  aiTone: {
    available: boolean;
    usedCount: number;
    limit: number;
    remaining: number;
    resetAt: string;
  };
}

export interface UserUsageResponse {
  isSuccess: true;
  code: "USER200_2";
  message: string;
  result: UserUsageResult;
}

/**
 * 플랜 및 템플릿·AI 톤 교정 사용량을 조회합니다.
 * 생성·삭제·복구·갤러리 저장 성공 후 refetch로 이 훅의 사용량을 갱신합니다.
 * 조회 실패 시 plan은 FREE, usage는 null을 반환하여 이전 Pro 사용량을 표시하지 않습니다.
 * 공통 HTTP 오류는 error의 FetchError에 상태·코드·메시지를 유지합니다.
 * 플랜 판정, 한도 및 다음 KST 리셋 시각은 서버 응답을 사용합니다.
 */
const useUserUsage = (accessToken: string) => {
  const [requestCount, setRequestCount] = useState(0);
  const refetch = useCallback(() => {
    setRequestCount((count) => count + 1);
  }, []);

  const { data, error } = useFetch<UserUsageResponse | null>(
    "/api/v1/users/me/usage",
    null,
    [accessToken, requestCount],
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      enabled: Boolean(accessToken),
      redirectOnError: false,
    }
  );

  const usage = !accessToken || error ? null : data?.result ?? null;

  return {
    data,
    error,
    usage,
    plan: usage?.plan ?? "FREE",
    refetch,
  };
};

export default useUserUsage;
