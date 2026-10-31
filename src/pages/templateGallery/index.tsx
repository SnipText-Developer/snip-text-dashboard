import Notice from "components/Notice";
import TemplateCopyDialog from "pages/templates/components/TemplateCopyDialog";
import TemplateGallery from "./components/TemplateGallery";
import useTemplateGalleryPage from "./hooks/useTemplateGalleryPage";
import sampleGalleryTemplates from "./sampleGalleryTemplates";

export default function TemplateGalleryPage() {
  const page = useTemplateGalleryPage();

  // TODO: API 연동 시 useGalleryTemplates 데이터를 연결합니다.
  return (
    <>
      <TemplateGallery
        templates={sampleGalleryTemplates}
        saving={page.saving}
        onCopy={page.onCopy}
        onAddToMyTemplates={page.onAddToMyTemplates}
      />
      {page.copyingTemplate && <TemplateCopyDialog
        key={page.copyingTemplate.galleryTemplateId}
        template={page.copyingTemplate}
        {...page.copyDialogProps}
      />}
      <Notice {...page.noticeProps} />
    </>
  );
}
