import "./TemplatePreview.css";
import { FormEvent, useState } from "react";
import { Template } from "models/template";
import { TemplateDraft } from "../types";

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
    <aside className="template-preview" aria-label="템플릿 미리보기">
      <div className="preview-top">
        <button type="button" className="preview-close" aria-label="미리보기 닫기" disabled={saving} onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m15 3-9 9 9 9" /></svg>
        </button>
        {template && draft && <div className="preview-tools">
          <button type="button" aria-label="템플릿 복사" onClick={() => onCopy({ ...template, ...draft, templateId: template.templateId, variables })}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="7" y="7" width="14" height="15" rx="1" /><path d="M18 3H3v16" /></svg>
          </button>
          <div className="preview-more">
            <button type="button" aria-label="템플릿 더 보기" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>⋯</button>
            {menuOpen && <div className="template-menu"><button type="button" disabled={saving} onClick={() => onDelete(template.templateId)}>삭제하기</button></div>}
          </div>
        </div>}
      </div>
      {draft ? <form className="preview-form" onSubmit={submit}>
        <fieldset disabled={saving}>
          <div className="preview-fields">
            <label>제목<input required value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} /></label>
            <label>/단축어<input required pattern="/?[^\s/]+" value={draft.shortcut} onChange={event => setDraft({ ...draft, shortcut: event.target.value })} /></label>
          </div>
          <label className="preview-content">내용<textarea required value={draft.content} onChange={event => setDraft({ ...draft, content: event.target.value })} /></label>
          <div className="preview-variables" aria-label="사용 중인 변수" aria-live="polite">
            {variables.map(variable => <span key={variable}>{`{{${variable}}}`}</span>)}
          </div>
        </fieldset>
        <div className="preview-actions">
          <button type="button" disabled={saving || !changed} onClick={() => setDraft(baseline)}>초기화</button>
          <button type="submit" disabled={saving || !changed}>{saving ? "저장 중…" : "저장"}</button>
        </div>
      </form> : <p role={error ? "alert" : "status"}>{error || "템플릿을 불러오고 있어요."}</p>}
    </aside>
  );
}
