// React

// External

// Local
import useCrossBrowsingPoliyfill from "customHooks/useCrossBrowsingPoliyfill";
import useDesktopSafariBackFix from "customHooks/useDesktopSafariBackFix";
import useScrollToTop from "customHooks/useScrollToTop";
import "App.css";

const App = () => {
  useCrossBrowsingPoliyfill();
  useDesktopSafariBackFix();
  useScrollToTop();

  return <div className="App"></div>;
};

export default App;
