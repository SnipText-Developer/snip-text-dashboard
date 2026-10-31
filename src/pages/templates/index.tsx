import TemplatesHeader from "./components/TemplatesHeader";
import TemplateList from "./components/TemplateList";
import TemplatePreview from "./components/TemplatePreview";
import TemplateEditor from "./components/TemplateEditor";
import TemplateCopyDialog from "components/template/TemplateCopyDialog";
import Notice from "components/notice/Notice";
import useTemplatesPage from "./hooks/useTemplatesPage";
import "./templates.css";

export default function TemplatesPage() {
  const page = useTemplatesPage();

  return (
    <section className={`templates-workspace ${page.hasPreview ? "has-preview" : ""}`} aria-label="내 템플릿">
      <div className="templates-main">
        {page.editing ? <TemplateEditor
          key={page.editing.templateId ?? "new"}
          initialDraft={page.editing}
          {...page.editorProps}
        /> : <>
        <TemplatesHeader {...page.headerProps} />
        <div className="templates-browser">
          <TemplateList {...page.listProps} />
          {page.previewVisible && <TemplatePreview key={page.previewProps.template?.templateId ?? "loading"} {...page.previewProps} />}
        </div>
        </>}
      </div>
      {page.copyingTemplate && <TemplateCopyDialog
        key={page.copyingTemplate.templateId}
        template={page.copyingTemplate}
        {...page.copyDialogProps}
      />}
      <Notice {...page.noticeProps} />

    </section>
  );
}
