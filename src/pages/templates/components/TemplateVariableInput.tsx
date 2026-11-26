import { RefObject, useLayoutEffect, useRef, useState } from "react";

const isValidVariableName = (name: string) => name.trim() !== "" && !/[{}\r\n]/.test(name);

/** Inserts {{name}} at the textarea cursor and restores focus after the content re-renders. */
export function useTemplateVariableInput(contentRef: RefObject<HTMLTextAreaElement | null>, content: string, onChange: (content: string) => void) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const insertionRangeRef = useRef({ start: 0, end: 0 });
  const selectionRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const start = selectionRef.current;
    if (start === null) return;
    contentRef.current?.focus();
    contentRef.current?.setSelectionRange(start, start);
    selectionRef.current = null;
  });

  function open() {
    const textarea = contentRef.current;
    if (!textarea) return;
    insertionRangeRef.current = { start: textarea.selectionStart, end: textarea.selectionEnd };
    setAdding(true);
  }

  function add(preset?: string) {
    const variableName = (preset ?? name).trim();
    if (!isValidVariableName(variableName)) return;
    const { start, end } = preset && contentRef.current
      ? { start: contentRef.current.selectionStart, end: contentRef.current.selectionEnd }
      : insertionRangeRef.current;
    const variable = `{{${variableName}}}`;
    selectionRef.current = start + variable.length;
    onChange(content.slice(0, start) + variable + content.slice(end));
    setName("");
    setAdding(false);
  }

  function cancel() {
    setAdding(false);
    setName("");
    contentRef.current?.focus();
  }

  return { adding, name, setName, open, add, cancel };
}

/** Name input shown after "+ 변수 추가" is pressed. */
export default function TemplateVariableInput({ variable }: { variable: ReturnType<typeof useTemplateVariableInput> }) {
  const { adding, name, setName, add, cancel } = variable;
  if (!adding) return null;
  return (
    <div className="template-editor-variable-input">
      <label><span className="template-editor-variable-label">변수명</span><input autoFocus placeholder="예: 이름, 회사명" value={name} onChange={event => setName(event.target.value)} onKeyDown={event => {
        if (event.key === "Enter" && !event.nativeEvent.isComposing) {
          event.preventDefault();
          add();
        }
      }} /></label>
      <div className="template-editor-variable-actions">
        <button type="button" className="template-editor-add-variable" disabled={!isValidVariableName(name)} onClick={() => add()}>추가</button>
        <button type="button" className="modal-cancel" onClick={cancel}>취소</button>
      </div>
    </div>
  );
}
