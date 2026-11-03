import TemplatesContent from "./components/TemplatesContent";
import TemplatesFeedback from "./components/TemplatesFeedback";
import useTemplatesPage from "./hooks/useTemplatesPage";
import "./templates.css";

export default function TemplatesPage() {
  const page = useTemplatesPage();

  return (
    <section className={`templates-workspace ${page.hasPreview ? "has-preview" : ""}`} aria-label="내 템플릿">
      <TemplatesContent
        editing={page.editing}
        editorProps={page.editorProps}
        headerProps={page.headerProps}
        listProps={page.listProps}
        previewVisible={page.previewVisible}
        previewProps={page.previewProps}
      />
      <TemplatesFeedback
        copyingTemplate={page.copyingTemplate}
        copyDialogProps={page.copyDialogProps}
        deleteDialogProps={page.deleteDialogProps}
        noticeProps={page.noticeProps}
      />
    </section>
  );
}
