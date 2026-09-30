// React
import { useEffect, useState } from "react";

// External

// Local
import { useLoading } from "contexts/LoadingProvider";
import { FetchError } from "models/errorType";
import { errorRedirect } from "utils/index";

interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: HeadersInit;
  body?: BodyInit;
  responseType?: "json" | "text";
  callback?: (data: object | string) => void;
}

/**
 * ✅ 공통 fetch 로직을 관리하는 Custom Hook
 * @param url API 요청 URL
 * @param defaultValue 초기 상태값
 * @param dependencies useEffect 의존성 배열
 * @param options fetch 옵션 (선택적)
 */
const useFetch = <T>(
  url: string,
  defaultValue: T,
  dependencies: any[] = [],
  options?: FetchOptions
) => {
  const { startLoading, stopLoading } = useLoading();
  const [data, setData] = useState<T>(defaultValue);
  const [error, setError] = useState<Error | FetchError | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        startLoading();
        setError(null); // 에러 초기화

        const response = await fetch(url, { signal, ...options });
        if (!response.ok) {
          throw new FetchError(response.status, response.statusText);
        }

        const result =
          options?.responseType === "text"
            ? await response.text()
            : await response.json();

        setData(result);
        options?.callback && options.callback(result);
      } catch (error: any) {
        if (error?.name === "AbortError") return; // 요청 취소 시 에러 무시
        setError(error);

        if (error instanceof FetchError) {
          errorRedirect({
            statusCode: error.status || 1002,
            message:
              error.message || "데이터를 불러오는 중 오류가 발생했습니다.",
          });
        }
      } finally {
        stopLoading();
      }
    };

    fetchData();

    return () => controller.abort(); // 컴포넌트 언마운트 시 요청 취소
    // eslint-disable-next-line
  }, dependencies); // 의존성 배열

  return { data, error };
};

export default useFetch;
