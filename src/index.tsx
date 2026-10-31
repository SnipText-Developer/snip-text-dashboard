// React
import React from "react";

// External
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Local
import App from "App";
import { LoadingProvider } from "contexts/LoadingProvider";
import usePromiseRejectionErrorHandler from "customHooks/usePromiseRejectionErrorHandler";
import ErrorBoundary from "components/error/ErrorBoundary";

import "index.css";
import { installTemplatesTestApi, testApiEnabled } from "testApi/templates";

if (testApiEnabled) installTemplatesTestApi();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

const Root = () => {
  usePromiseRejectionErrorHandler();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LoadingProvider>
          <App />
        </LoadingProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
