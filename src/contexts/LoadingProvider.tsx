// React
import React, { createContext, useState, useContext, useCallback } from "react";

// External

// Local

interface LoadingProviderProps {
  children: React.ReactNode;
}

const LoadingContext = createContext<{
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = useCallback(() => {
    setLoadingCount((prev) => prev + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingCount((prev) => Math.max(0, prev - 1)); // 음수 방지
  }, []);

  return (
    <LoadingContext
      value={{
        isLoading: loadingCount > 0,
        startLoading,
        stopLoading,
      }}
    >
      {children}
    </LoadingContext>
  );
};

const useLoading = () => useContext(LoadingContext);

export { LoadingProvider, useLoading };
