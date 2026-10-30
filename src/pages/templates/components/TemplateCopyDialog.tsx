import { FormEvent, useState } from "react";
import { Template } from "models/template";
import Modal from "components/Modal";

interface TemplateCopyDialogProps {
  template: Template;
  onClose: () => void;
  onCopy: (content: string) => Promise<boolean>;
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
      eyebrow={template.title}
      title="변수를 채워주세요"
      description="필수 항목을 모두 입력하면 완성된 문구를 복사할 수 있어요."
      submitLabel={copying ? "복사 중…" : "클립보드에 복사"}
      submitDisabled={!complete || copying}
      onClose={onClose}
      onSubmit={submit}
    >
      {variables.map((variable, index) => <label key={variable}>
        {variable}
        <input autoFocus={index === 0} required placeholder={`${variable} 입력`} value={values[variable] ?? ""} onChange={event => setValues(current => ({ ...current, [variable]: event.target.value }))} />
      </label>)}
    </Modal>
  );
}
