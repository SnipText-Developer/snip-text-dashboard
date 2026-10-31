import { FormEventHandler, ReactNode, useEffect, useId, useRef } from "react";
import TemplateDetailFrame from "./TemplateDetailFrame";
import TemplateVariables from "./TemplateVariables";

interface TemplateDetailProps {
  title?: string;
  shortcut?: string;
  content?: string;
  variables: string[];
  label: string;
  backLabel: string;
  onBack: () => void;
  saving?: boolean;
  editable?: boolean;
  onChange?: (field: "title" | "shortcut" | "content", value: string) => void;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  tools?: ReactNode;
  actions: ReactNode;
  hint?: string;
  status?: ReactNode;
  focusTitle?: boolean;
  className?: string;
}

/** Both template pages share the same panel, fields, variables and action layout. */
export default function TemplateDetail({ title, shortcut, content, variables, label, backLabel, onBack, saving, editable, onChange, onSubmit, tools, actions, hint, status, focusTitle, className = "" }: TemplateDetailProps) {
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusTitle) titleRef.current?.focus();
  }, [focusTitle]);

  return (
    <TemplateDetailFrame
      label={label}
      backLabel={backLabel}
      onBack={onBack}
      saving={saving}
      className={className}
      tools={tools}
      status={status}
      actions={actions}
      hint={hint}
      onSubmit={onSubmit}
    >
        <fieldset disabled={saving}>
          <div className="template-detail__fields">
            {editable ? <>
              <label>제목<input required value={title} onChange={event => onChange?.("title", event.target.value)} /></label>
              <label>/단축어<input required pattern="/?[^\s/]+" value={shortcut} onChange={event => onChange?.("shortcut", event.target.value)} /></label>
            </> : <h2 ref={titleRef} id={titleId} tabIndex={-1}>{title}</h2>}
          </div>
          <label className="template-detail__content">내용
            {editable ? <textarea required value={content} onChange={event => onChange?.("content", event.target.value)} />
              : <textarea readOnly value={content} />}
          </label>
          {variables.length > 0 && <TemplateVariables className="template-detail__variables" variables={variables} />}
        </fieldset>
    </TemplateDetailFrame>
  );
}
