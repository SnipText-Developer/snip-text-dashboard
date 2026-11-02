import TemplateCopyDialog from "components/template/TemplateCopyDialog";
import Notice from "components/notice/Notice";
import type useTemplatesPage from "../hooks/useTemplatesPage";

type TemplatesFeedbackProps = Pick<
  ReturnType<typeof useTemplatesPage>,
  "copyingTemplate" | "copyDialogProps" | "noticeProps"
>;

export default function TemplatesFeedback({
  copyingTemplate,
  copyDialogProps,
  noticeProps,
}: TemplatesFeedbackProps) {
  return (
    <>
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
