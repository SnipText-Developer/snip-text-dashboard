import TemplateCopyDialog from "components/template/TemplateCopyDialog";
import Notice from "components/notice/Notice";
import TemplateDeleteDialog from "./TemplateDeleteDialog";
import type useTemplatesPage from "../hooks/useTemplatesPage";

type TemplatesFeedbackProps = Pick<
  ReturnType<typeof useTemplatesPage>,
  "copyingTemplate" | "copyDialogProps" | "deleteDialogProps" | "noticeProps"
>;

export default function TemplatesFeedback({
  copyingTemplate,
  copyDialogProps,
  deleteDialogProps,
  noticeProps,
}: TemplatesFeedbackProps) {
  return (
    <>
      {deleteDialogProps && <TemplateDeleteDialog {...deleteDialogProps} />}
      {copyingTemplate && (
        <TemplateCopyDialog
          key={copyingTemplate.templateId}
          template={copyingTemplate}
          {...copyDialogProps}
        />
      )}
      <Notice {...noticeProps} />
    </>
  );
}
