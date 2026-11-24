import "./Modal.css";
import { FormEventHandler, ReactNode, useEffect, useId, useRef, useState } from "react";
import Notice from "components/notice/Notice";

interface ModalProps {
  eyebrow?: string;
  danger?: boolean;
  variant?: "confirmation" | "variables";
  closeDisabled?: boolean;
  error?: string;
  title: string;
  description: string;
  children?: ReactNode;
  submitLabel: string;
  submitDisabled: boolean;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export default function Modal({
  eyebrow, title, description, children, submitLabel, submitDisabled, onClose, onSubmit,
  variant, danger = false, closeDisabled = false, error,
}: ModalProps) {
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
    <dialog ref={dialogRef} className={variant ? `modal modal--${variant}` : "modal"} aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={event => { event.preventDefault(); if (!closeDisabled) onClose(); }}>
      <form onSubmit={onSubmit} onInput={() => setValidationMessage("")} onInvalid={event => {
        event.preventDefault();
        const field = event.target as HTMLInputElement | HTMLTextAreaElement;
        if (field !== event.currentTarget.querySelector(":invalid")) return;
        setValidationMessage(field.validity.valueMissing ? "이 입력란을 입력해 주세요." : field.validationMessage);
        field.focus();
      }}>
        <header className="modal-header">
          <div>{eyebrow && <p>{eyebrow}</p>}<h2 id={titleId}>{title}</h2></div>
          {!variant && <button type="button" className="modal-close" aria-label="모달 닫기" disabled={closeDisabled} onClick={onClose}>×</button>}
        </header>
        <div className="modal-body">
          <p id={descriptionId}>{description}</p>
          {children}
          {error && <Notice placement="inline" tone="error" message={error} />}
          <Notice placement="inline" tone="error" message={validationMessage} onClose={() => setValidationMessage("")} />
        </div>
        <footer className="modal-footer">
          <button type="button" className="modal-cancel" disabled={closeDisabled} onClick={onClose}>취소</button>
          <button type="submit" className={`modal-submit${danger ? " modal-submit--danger" : ""}`} disabled={submitDisabled}>{submitLabel}</button>
        </footer>
      </form>
    </dialog>
  );
}
