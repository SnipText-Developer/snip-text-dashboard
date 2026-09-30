// React
import { useEffect } from "react";

// External

// Local
import { errorRedirect } from "utils/index";

const usePromiseRejectionErrorHandler = () => {
  useEffect(() => {
    // 처리되지 않은 Promise Rejection
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      errorRedirect({
        statusCode: 1001,
        message: event.reason || "예기치 못한 문제가 발생했습니다.",
      });
    };

    // 이벤트 리스너 등록
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      // 컴포넌트 언마운트 시 리스너 해제
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);
};

export default usePromiseRejectionErrorHandler;
