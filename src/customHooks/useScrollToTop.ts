// React
import { useEffect } from "react";

// External
import { useLocation } from "react-router-dom";

// Local
import { useLoading } from "contexts/LoadingProvider";

const useScrollToTop = () => {
  const { pathname } = useLocation();
  const { isLoading } = useLoading();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!isLoading) {
      window.scrollTo(0, 0);
    }
  }, [isLoading]);
};

export default useScrollToTop;
