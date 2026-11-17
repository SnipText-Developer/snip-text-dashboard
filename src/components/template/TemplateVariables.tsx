import { ReactNode } from "react";

interface TemplateVariablesProps {
  variables: string[];
  className?: string;
  itemClassName?: string;
  children?: ReactNode;
}

export default function TemplateVariables({ variables, className, itemClassName, children }: TemplateVariablesProps) {
  return (
    <div className={className} aria-label="사용 중인 변수" aria-live="polite">
      {Array.from(new Set(variables)).map(variable => (
        <span key={variable} className={itemClassName}>{`{{${variable}}}`}</span>
      ))}
      {children}
    </div>
  );
}
