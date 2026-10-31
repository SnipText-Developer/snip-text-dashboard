import { ReactNode } from "react";

interface TemplateEmptyMessageProps {
  title: string;
  description: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  decoration?: ReactNode;
}

export default function TemplateEmptyMessage({ title, description, className, titleClassName, descriptionClassName, decoration }: TemplateEmptyMessageProps) {
  return (
    <div className={className} role="status">
      {decoration}
      <h2 className={titleClassName}>{title}</h2>
      <p className={descriptionClassName}>{description}</p>
    </div>
  );
}
