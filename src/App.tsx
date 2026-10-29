// React

// External
import { Route, Routes } from "react-router-dom";

// Local
import useCrossBrowsingPoliyfill from "customHooks/useCrossBrowsingPoliyfill";
import useDesktopSafariBackFix from "customHooks/useDesktopSafariBackFix";
import useScrollToTop from "customHooks/useScrollToTop";
import "App.css";
import DashboardLayout from "components/dashboard/DashboardLayout";
import { TemplatesPage, TemplateGalleryPage, AiTonePage } from "pages";

const App = () => {
  useCrossBrowsingPoliyfill();
  useDesktopSafariBackFix();
  useScrollToTop();

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<TemplatesPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="gallery" element={<TemplateGalleryPage />} />
        <Route path="ai-tone" element={<AiTonePage />} />
        <Route path="*" element={<section className="page-entry"><h1>페이지를 찾을 수 없어요</h1></section>} />
      </Route>
    </Routes>
  );
};

export default App;
