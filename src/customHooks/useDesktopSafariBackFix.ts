// React
import { useEffect } from "react";

// External
import { isMacOs, isSafari } from "mobile-device-detect";

// Local

// Desktop Safari에서 트랙패드로 뒤로가기, 앞으로가기 이용 시 브라우저가 1초간 멈추는 이슈 해결
const useDesktopSafariBackFix = () => {
  useEffect(() => {
    if (!(isMacOs && isSafari)) return;

    const handlePageShow = (event: { persisted: boolean }) => {
      if (event.persisted) {
        window.location.reload();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);
};

export default useDesktopSafariBackFix;
