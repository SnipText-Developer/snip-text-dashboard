// React
import { useEffect } from "react";

// External

// Local

const useCrossBrowsingPoliyfill = () => {
  useEffect(() => {
    const isCssVariablesNotSupported =
      !window.CSS ||
      !window.CSS.supports ||
      !window.CSS.supports("--custom-prop", "1");

    const isCssViSelectorNotSupported =
      !window.CSS ||
      !window.CSS.supports ||
      !window.CSS.supports("selector(:nth-child(1))") ||
      !window.CSS.supports("selector(:not(.class))");

    const html5Elem = document.createElement("nav");
    const isHTML5NotSupported = html5Elem instanceof HTMLUnknownElement;

    // css 변수 크로스 브라우징
    if (isCssVariablesNotSupported) {
      import("css-vars-ponyfill")
        .then((module) => {
          const cssVars = module.default;
          cssVars({ watch: true, onlyLegacy: true });
        })
        .catch((err) => {});
    }

    // css3 가상 선택자 크로스 브라우징
    if (isCssViSelectorNotSupported) {
      import("selectivizr");
    }

    // html5 크로스 브라우징
    if (isHTML5NotSupported) {
      import("html5shiv");
    }
  }, []);
};

export default useCrossBrowsingPoliyfill;
