import { FormEventHandler, ReactNode } from "react";
import TemplateBackButton from "./TemplateBackButton";
import "./TemplateDetail.css";

interface TemplateDetailFrameProps {
  label: string;
  backLabel: string;
  onBack: () => void;
  saving?: boolean;
  className?: string;
  tools?: ReactNode;
  status?: ReactNode;
  children: ReactNode;
  actions: ReactNode;
  hint?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
}

/** Shared detail shell for personal templates and gallery templates. */
export default function TemplateDetailFrame({ label, backLabel, onBack, saving, className = "", tools, status, children, actions, hint, onSubmit }: TemplateDetailFrameProps) {
  return (
    <section className={`template-detail ${className}`} aria-label={label}>
      <header className="template-detail__header">
        <TemplateBackButton className="template-detail__back" aria-label={backLabel} disabled={saving} onClick={onBack} />
        {tools}
      </header>
      {status || <form className="template-detail__form" onSubmit={event => { event.preventDefault(); onSubmit?.(event); }}>
        {children}
        <footer className="template-detail__footer">
          {hint && <p>{hint}</p>}
          <div className="template-detail__actions">{actions}</div>
        </footer>
      </form>}
    </section>
  );
}
