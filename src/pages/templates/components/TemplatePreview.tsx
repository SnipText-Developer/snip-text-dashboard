import TemplateDetail from "components/template/TemplateDetail";
import "./TemplatePreview.css";
import { FormEvent, useState } from "react";
import { Template } from "models/template";
import { TemplateDraft } from "../types";
import copyIcon from "assets/icons/detail-copy.svg";
import moreIcon from "assets/icons/detail-more.svg";

interface TemplatePreviewProps {
  template?: Template;
  error?: string;
  saving: boolean;
  onClose: () => void;
  onSave: (draft: TemplateDraft) => Promise<boolean>;
  onDelete: (id: number) => Promise<void>;
  onCopy: (template: Template) => void;
}

export default function TemplatePreview({ template, error, saving, onClose, onSave, onDelete, onCopy }: TemplatePreviewProps) {
  const [draft, setDraft] = useState<TemplateDraft | null>(() => template ? { ...template } : null);
  const [baseline, setBaseline] = useState(draft);
  const [menuOpen, setMenuOpen] = useState(false);
  const variables = Array.from(new Set(Array.from((draft?.content ?? "").matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g), match => match[1].trim()).filter(Boolean)));
  const changed = draft && baseline && (draft.title !== baseline.title || draft.shortcut !== baseline.shortcut || draft.content !== baseline.content);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft || saving) return;
    if (await onSave(draft)) {
      const saved = { ...draft, shortcut: `/${draft.shortcut.trim().replace(/^\/+/, "")}` };
      setDraft(saved);
      setBaseline(saved);
    }
  }

  return (
    <TemplateDetail
      className="template-preview"
      label="템플릿 미리보기"
      backLabel="미리보기 닫기"
      onBack={onClose}
      saving={saving}
      editable
      title={draft?.title}
      shortcut={draft?.shortcut}
      content={draft?.content}
      variables={variables}
      onChange={(field, value) => setDraft(current => current ? { ...current, [field]: value } : current)}
      onSubmit={submit}
      tools={template && draft && <div className="preview-tools">
          <button type="button" aria-label="템플릿 복사" onClick={() => onCopy({ ...template, ...draft, templateId: template.templateId, variables })}>
            <img src={copyIcon} alt="" width={32} height={32} />
          </button>
          <div className="preview-more">
            <button type="button" aria-label="템플릿 더 보기" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><img src={moreIcon} alt="" width={32} height={32} /></button>
            {menuOpen && <div className="template-menu"><button type="button" disabled={saving} onClick={() => onDelete(template.templateId)}>삭제하기</button></div>}
          </div>
        </div>}
      status={!draft ? <p role={error ? "alert" : "status"}>{error || "템플릿을 불러오고 있어요."}</p> : undefined}
      actions={<>
        <button type="button" disabled={saving || !changed} onClick={() => setDraft(baseline)}>되돌리기</button>
        <button type="submit" disabled={saving || !changed}>{saving ? "저장 중…" : "저장"}</button>
      </>}
    />
  );
}
