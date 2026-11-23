import useGalleryTemplates from "customHooks/templateGallery/useGalleryTemplates";
import Notice from "components/notice/Notice";
import TemplateCopyDialog from "components/template/TemplateCopyDialog";
import TemplateGallery from "./components/TemplateGallery";
import useTemplateGalleryPage from "./hooks/useTemplateGalleryPage";

export default function TemplateGalleryPage() {
  const page = useTemplateGalleryPage();

  const { data, error } = useGalleryTemplates();
  const templates = data?.result.templates;

  if (!templates) {
    return (
      <section className="page-entry">
        <h1>템플릿 갤러리</h1>
        {error
          ? <Notice message="갤러리 템플릿을 불러오지 못했어요." placement="inline" tone="error" />
          : <p role="status">갤러리 템플릿을 불러오는 중이에요.</p>}
      </section>
    );
  }
  return (
    <>
      <TemplateGallery
        templates={templates}
        saving={page.saving}
        searchQuery={page.searchQuery}
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
