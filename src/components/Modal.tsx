import "./Modal.css";
import { FormEventHandler, ReactNode, useEffect, useId, useRef, useState } from "react";
import Notice from "components/Notice";

interface ModalProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  submitLabel: string;
  submitDisabled: boolean;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export default function Modal({ eyebrow, title, description, children, submitLabel, submitDisabled, onClose, onSubmit }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [validationMessage, setValidationMessage] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog ref={dialogRef} className="modal" aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={onClose}>
      <form onSubmit={onSubmit} onInput={() => setValidationMessage("")} onInvalid={event => {
        event.preventDefault();
        const field = event.target as HTMLInputElement | HTMLTextAreaElement;
        if (field !== event.currentTarget.querySelector(":invalid")) return;
        setValidationMessage(field.validity.valueMissing ? "이 입력란을 입력해 주세요." : field.validationMessage);
        field.focus();
      }}>
        <header className="modal-header">
          <div><p>{eyebrow}</p><h2 id={titleId}>{title}</h2></div>
          <button type="button" className="modal-close" aria-label="입력 모달 닫기" onClick={onClose}>×</button>
        </header>
        <div className="modal-body">
          <p id={descriptionId}>{description}</p>
          {children}
          <Notice placement="inline" message={validationMessage} onClose={() => setValidationMessage("")} />
        </div>
        <footer className="modal-footer">
          <button type="button" className="modal-cancel" onClick={onClose}>취소</button>
          <button type="submit" className="modal-submit" disabled={submitDisabled}>{submitLabel}</button>
        </footer>
      </form>
    </dialog>
  );
}
