import "./TemplateCopyDialog.css";
import { FormEvent, useState } from "react";
import { Template } from "models/template";
import Modal from "components/modal/Modal";

interface TemplateCopyDialogProps {
  template: Pick<Template, "title" | "content" | "variables">;
  onClose: () => void;
  onCopy: (content: string) => Promise<boolean>;
}

function variablePlaceholder(variable: string) {
  const last = variable.charCodeAt(variable.length - 1);
  const particle = last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0 ? "을" : "를";
  return `${variable}${particle} 입력하세요.`;
}

export default function TemplateCopyDialog({ template, onClose, onCopy }: TemplateCopyDialogProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [copying, setCopying] = useState(false);
  const variables = Array.from(new Set(template.variables));
  const complete = variables.every(variable => values[variable]?.trim());

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!complete || copying) return;
    const content = template.content.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (placeholder, name: string) =>
      Object.prototype.hasOwnProperty.call(values, name) ? values[name] : placeholder
    );
    setCopying(true);
    try {
      if (await onCopy(content)) onClose();
    } finally { setCopying(false); }
  }

  return (
    <Modal
      className="template-copy-dialog"
      eyebrow={template.title}
      title="변수 값을 입력해주세요"
      description="내용을 복사하려면 모든 변수 값을 입력해야 합니다."
      submitLabel={copying ? "복사 중…" : "입력하고 복사"}
      submitDisabled={!complete || copying}
      onClose={onClose}
      onSubmit={submit}
    >
      {variables.map((variable, index) => <label key={variable}>
        <span className="copy-variable-label">{`*(${variable})`}</span>
        <input autoFocus={index === 0} required placeholder={variablePlaceholder(variable)} value={values[variable] ?? ""} onChange={event => setValues(current => ({ ...current, [variable]: event.target.value }))} />
      </label>)}
    </Modal>
  );
}
