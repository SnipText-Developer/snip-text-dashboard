// React

// External
import { Route, Routes } from "react-router-dom";

// Local
import useCrossBrowsingPoliyfill from "customHooks/useCrossBrowsingPoliyfill";
import useDesktopSafariBackFix from "customHooks/useDesktopSafariBackFix";
import useScrollToTop from "customHooks/useScrollToTop";
import "App.css";
import { googleCallbackPath } from "api/auth/google";
import GoogleCallback from "components/dashboard/GoogleCallback";
import DashboardLayout from "components/dashboard/DashboardLayout";
import TrashPage from "pages/trash";
import { TemplatesPage, TemplateGalleryPage, AiTonePage } from "pages";

const App = () => {
  useCrossBrowsingPoliyfill();
  useDesktopSafariBackFix();
  useScrollToTop();

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path={googleCallbackPath} element={<GoogleCallback />} />
        <Route index element={<TemplatesPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="templates/new" element={<TemplatesPage />} />
        <Route path="templates/:templateId/edit" element={<TemplatesPage />} />
        <Route path="trash" element={<TrashPage />} />
        <Route path="gallery" element={<TemplateGalleryPage />} />
        <Route path="ai-tone" element={<AiTonePage />} />
        <Route path="*" element={<section className="page-entry"><h1>페이지를 찾을 수 없어요</h1></section>} />
      </Route>
    </Routes>
  );
};

export default App;
