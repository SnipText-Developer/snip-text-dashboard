import TemplatesHeader from "./components/TemplatesHeader";
import TemplateList from "./components/TemplateList";
import TemplatePreview from "./components/TemplatePreview";
import TemplateEditor from "./components/TemplateEditor";
import TemplateCopyDialog from "./components/TemplateCopyDialog";
import Notice from "components/Notice";
import useTemplatesPage from "./hooks/useTemplatesPage";
import "./templates.css";

export default function TemplatesPage() {
  const page = useTemplatesPage();

  return (
    <section className={`templates-workspace ${page.hasPreview ? "has-preview" : ""}`} aria-label="내 템플릿">
      <div className="templates-main">
        <TemplatesHeader {...page.headerProps} />
        <TemplateList {...page.listProps} />
      </div>
      {page.previewVisible && <TemplatePreview {...page.previewProps} />}
      {page.copyingTemplate && <TemplateCopyDialog
        key={page.copyingTemplate.templateId}
        template={page.copyingTemplate}
        {...page.copyDialogProps}
      />}
      <Notice {...page.noticeProps} />
      {page.editing && <TemplateEditor
        key={page.editing.templateId ?? "new"}
        initialDraft={page.editing}
        {...page.editorProps}
      />}
    </section>
  );
}
