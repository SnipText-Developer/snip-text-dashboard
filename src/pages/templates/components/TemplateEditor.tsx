import "./TemplateEditor.css";
import { FormEvent, useLayoutEffect, useRef, useState } from "react";
import { TemplateDraft } from "../types";
import Modal from "components/Modal";

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

  function addVariable() {
    const name = variableName.trim();
    if (!name || /[{}\r\n]/.test(name)) return;
    const { start, end } = insertionRangeRef.current;
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
    onSave(draft);
  }

  return (
    <Modal
      eyebrow="내 템플릿"
      title={draft.templateId === null ? "새 템플릿" : "템플릿 편집"}
      description="자주 쓰는 문구를 저장하고 단축어로 바로 불러오세요."
      submitLabel={saving ? "저장 중…" : "저장하기"}
      submitDisabled={saving}
      onClose={onClose}
      onSubmit={submit}
    >
      <label>제목<input autoFocus required placeholder="제목 입력" value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} /></label>
      <label>단축어<input required pattern="/?[^\s/]+" placeholder="/단축어" value={draft.shortcut} onChange={event => setDraft({ ...draft, shortcut: event.target.value })} /></label>
      <label>내용<textarea ref={contentRef} required rows={5} placeholder="템플릿 내용 입력" value={draft.content} onChange={event => setDraft({ ...draft, content: event.target.value })} /></label>
      <section className="template-editor-variables" aria-label="사용 중인 변수" aria-live="polite">
        <strong>사용 중인 변수 {variables.length}개</strong>
        {variables.length > 0 ? <ul>
          {variables.map(variable => <li key={variable}>{`{{${variable}}}`}</li>)}
        </ul> : <p>사용 중인 변수가 없어요.</p>}
      </section>
      {!addingVariable && <button type="button" className="template-editor-add-variable" onClick={openVariableInput}>변수 추가</button>}
      {addingVariable && <div className="template-editor-variable-input">
        <label>변수명<input autoFocus placeholder="예: 이름, 회사명" value={variableName} onChange={event => setVariableName(event.target.value)} onKeyDown={event => {
          if (event.key === "Enter" && !event.nativeEvent.isComposing) {
            event.preventDefault();
            addVariable();
          }
        }} /></label>
        <div className="template-editor-variable-actions">
          <button type="button" className="template-editor-add-variable" disabled={!variableName.trim() || /[{}\r\n]/.test(variableName)} onClick={addVariable}>추가</button>
          <button type="button" className="modal-cancel" onClick={() => { setAddingVariable(false); setVariableName(""); contentRef.current?.focus(); }}>취소</button>
        </div>
      </div>}
    </Modal>
  );
}
