import type useTemplatesPage from "../hooks/useTemplatesPage";
import TemplateEditor from "./TemplateEditor";
import TemplatesHeader from "./TemplatesHeader";
import TemplateList from "./TemplateList";
import TemplatePreview from "./TemplatePreview";

type TemplatesContentProps = Pick<
  ReturnType<typeof useTemplatesPage>,
  "editing" | "editorProps" | "headerProps" | "listProps" | "previewVisible" | "previewProps"
>;

export default function TemplatesContent({
  editing,
  editorProps,
  headerProps,
  listProps,
  previewVisible,
  previewProps,
}: TemplatesContentProps) {
  return (
    <div className="templates-main">
      {editing ? (
        <TemplateEditor
          key={editing.templateId ?? "new"}
          initialDraft={editing}
          {...editorProps}
        />
      ) : (
        <>
          <TemplatesHeader {...headerProps} />
          <div className="templates-browser">
            <TemplateList {...listProps} />
            {previewVisible && (
              <TemplatePreview
                key={previewProps.template?.templateId ?? "loading"}
                {...previewProps}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
