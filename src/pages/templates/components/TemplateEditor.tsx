import "./TemplateEditor.css";
import { FormEvent, useRef, useState } from "react";
import TemplateVariableInput, { useTemplateVariableInput } from "components/template/TemplateVariableInput";
import { TemplateDraft } from "../types";

interface TemplateEditorProps {
  initialDraft: TemplateDraft;
  saving: boolean;
  onClose: () => void;
  onSave: (draft: TemplateDraft) => Promise<void>;
}

export default function TemplateEditor({ initialDraft, saving, onClose, onSave }: TemplateEditorProps) {
  const [draft, setDraft] = useState(initialDraft);
  const variables = Array.from(new Set(
    Array.from(draft.content.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g), match => match[1].trim()).filter(Boolean),
  ));
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const variableInput = useTemplateVariableInput(contentRef, draft.content, content => setDraft({ ...draft, content }));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!saving) onSave(draft);
  }

  return (
    <section className="template-editor-page" aria-labelledby="template-editor-heading">
      <button type="button" className="template-editor-back" disabled={saving} onClick={onClose} aria-label="뒤로가기">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m15 3-9 9 9 9" /></svg>
        뒤로가기
      </button>
      <h1 id="template-editor-heading">{draft.templateId === null ? "새 템플릿" : "템플릿 편집"}</h1>
      <p className="page-description">자주 사용하는 문장을 저장하고 단축어로 빠르게 불러오세요.</p>
      <form className="template-editor-form" onSubmit={submit}>
        <fieldset disabled={saving}>
        <div className="template-editor-fields">
      <label>제목<input autoFocus required placeholder="입력하세요." value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} /></label>
      <label>단축어<input required pattern="/?[^\s/]+" placeholder="입력하세요." value={draft.shortcut} onChange={event => setDraft({ ...draft, shortcut: event.target.value })} /></label>
        </div>
      <label className="template-editor-content">내용<textarea ref={contentRef} required rows={5} placeholder="내용을 입력하세요." value={draft.content} onChange={event => setDraft({ ...draft, content: event.target.value })} /></label>
      <div className="template-editor-variables" aria-label="변수 삽입">
        <button type="button" className="template-editor-add-variable" onClick={variableInput.open}>+ 변수 추가</button>
        {Array.from(new Set(["날짜", "이름", ...variables])).map(variable => (
          <button type="button" className="template-editor-variable-chip" key={variable} onClick={() => variableInput.add(variable)}>{`{{${variable}}}`}</button>
        ))}
      </div>
      <TemplateVariableInput variable={variableInput} />
        </fieldset>
        <div className="template-editor-actions">
          <button type="button" disabled={saving || (draft.title === initialDraft.title && draft.shortcut === initialDraft.shortcut && draft.content === initialDraft.content)} onClick={() => setDraft(initialDraft)}>초기화</button>
          <button type="submit" disabled={saving || !draft.title.trim() || !draft.shortcut.trim().replace(/^\/+/, "") || !draft.content.trim()}>{saving ? "저장 중…" : draft.templateId === null ? "생성하기" : "저장하기"}</button>
        </div>
      </form>
    </section>
  );
}
