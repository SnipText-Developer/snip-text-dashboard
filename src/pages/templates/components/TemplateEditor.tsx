import "./TemplateEditor.css";
import { FormEvent, useLayoutEffect, useRef, useState } from "react";
import { TemplateDraft } from "../types";

interface TemplateEditorProps {
  initialDraft: TemplateDraft;
  saving: boolean;
  onClose: () => void;
  onSave: (draft: TemplateDraft) => Promise<void>;
}

export default function TemplateEditor({ initialDraft, saving, onClose, onSave }: TemplateEditorProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [addingVariable, setAddingVariable] = useState(false);
  const [variableName, setVariableName] = useState("");
  const variables = Array.from(new Set(
    Array.from(draft.content.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g), match => match[1].trim()).filter(Boolean),
  ));
  const insertionRangeRef = useRef({ start: 0, end: 0 });
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const variableSelectionRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const start = variableSelectionRef.current;
    if (start === null) return;
    contentRef.current?.focus();
    contentRef.current?.setSelectionRange(start, start);
    variableSelectionRef.current = null;
  });

  function openVariableInput() {
    const content = contentRef.current;
    if (!content) return;
    insertionRangeRef.current = { start: content.selectionStart, end: content.selectionEnd };
    setAddingVariable(true);
  }

  function addVariable(preset?: string) {
    const name = (preset ?? variableName).trim();
    if (!name || /[{}\r\n]/.test(name)) return;
    const { start, end } = preset && contentRef.current
      ? { start: contentRef.current.selectionStart, end: contentRef.current.selectionEnd }
      : insertionRangeRef.current;
    const variable = `{{${name}}}`;
    variableSelectionRef.current = start + variable.length;
    setDraft(current => ({
      ...current,
      content: current.content.slice(0, start) + variable + current.content.slice(end),
    }));
    setVariableName("");
    setAddingVariable(false);
  }

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
      <label>제목<input autoFocus required placeholder="템플릿 제작 중입니다." value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} /></label>
      <label>/단축어<input required pattern="/?[^\s/]+" placeholder="/ㄷㅊㅇ" value={draft.shortcut} onChange={event => setDraft({ ...draft, shortcut: event.target.value })} /></label>
        </div>
      <label className="template-editor-content">내용<textarea ref={contentRef} required rows={5} placeholder="안녕하세요." value={draft.content} onChange={event => setDraft({ ...draft, content: event.target.value })} /></label>
      <div className="template-editor-variables" aria-label="변수 삽입">
        <button type="button" className="template-editor-add-variable" onClick={openVariableInput}>변수 삽입 ＋</button>
        {Array.from(new Set(["날짜", "이름", ...variables])).map(variable => (
          <button type="button" className="template-editor-variable-chip" key={variable} onClick={() => addVariable(variable)}>{`{{${variable}}}`}</button>
        ))}
      </div>
      {addingVariable && <div className="template-editor-variable-input">
        <label><span className="template-editor-variable-label">변수명</span><input autoFocus placeholder="예: 이름, 회사명" value={variableName} onChange={event => setVariableName(event.target.value)} onKeyDown={event => {
          if (event.key === "Enter" && !event.nativeEvent.isComposing) {
            event.preventDefault();
            addVariable();
          }
        }} /></label>
        <div className="template-editor-variable-actions">
          <button type="button" className="template-editor-add-variable" disabled={!variableName.trim() || /[{}\r\n]/.test(variableName)} onClick={() => addVariable()}>추가</button>
          <button type="button" className="modal-cancel" onClick={() => { setAddingVariable(false); setVariableName(""); contentRef.current?.focus(); }}>취소</button>
        </div>
      </div>}
        </fieldset>
        <div className="template-editor-actions">
          <button type="button" disabled={saving} onClick={onClose}>취소</button>
          <button type="submit" disabled={saving || !draft.title.trim() || !draft.shortcut.trim().replace(/^\/+/, "") || !draft.content.trim()}>{saving ? "저장 중…" : "저장하기"}</button>
        </div>
      </form>
    </section>
  );
}
