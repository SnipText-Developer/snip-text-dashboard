import { useCallback, useState } from "react";
import useFetch from "customHooks/useFetch";
import { Template } from "models/template";

export interface TemplatesResult {
  totalCount: number;
  templates: Template[];
}

export type TemplatesResponse =
  | {
      isSuccess: true;
      code: "TEMPLATE200_1";
      message: string;
      result: TemplatesResult;
    }
  | {
      isSuccess: false;
      code: string;
      message: string;
      result: null;
    };

const useTemplates = (accessToken: string) => {
  const [requestCount, setRequestCount] = useState(0);
  const refetch = useCallback(() => setRequestCount(count => count + 1), []);
  const result = useFetch<TemplatesResponse | null>("/api/v1/templates", null, [accessToken, requestCount], {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    enabled: Boolean(accessToken),
    redirectOnError: false,
  });
  return { ...result, refetch };
};

export default useTemplates;
