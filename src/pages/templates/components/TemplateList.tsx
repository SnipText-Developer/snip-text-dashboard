import "./TemplateList.css";
import { useState } from "react";
import { Template } from "models/template";
import TemplateEmptyState from "./TemplateEmptyState";

interface TemplateListProps {
  templates: Template[];
  selectedId: number | null;
  saving: boolean;
  authenticated: boolean;
  loading: boolean;
  error?: string;
  query: string;
  onSelect: (id: number) => void;
  onCopy: (template: Template) => void;
  onEdit: (template: Template) => void;
  onDelete: (id: number) => Promise<void>;
  onRetry: () => void;
}

export default function TemplateList({ templates, selectedId, saving, authenticated, loading, error, query, onSelect, onCopy, onEdit, onDelete, onRetry }: TemplateListProps) {
  const [menuId, setMenuId] = useState<number | null>(null);

  async function remove(id: number) {
    await onDelete(id);
    setMenuId(null);
  }

  return (
    <div className="template-list" aria-label="템플릿 목록">
      {templates.map(template => (
        <div className={`template-row ${selectedId === template.templateId ? "is-selected" : ""}`} key={template.templateId}>
          <button className="template-select" onClick={() => onSelect(template.templateId)} aria-pressed={selectedId === template.templateId}>
            <span className="shortcut-pill">{template.shortcut}</span>
            <span className="template-info">
              <strong>{template.title}</strong>
              <span className="variable-tags">{template.variables.map(variable => <span key={variable}>{`{{${variable}}}`}</span>)}</span>
            </span>
          </button>
          <button className="row-copy" onClick={() => onCopy(template)} aria-label={`${template.title} 복사`}>복사</button>
          <div className="template-more">
            <button className="more-button" aria-label={`${template.title} 더 보기`} aria-expanded={menuId === template.templateId} onClick={() => setMenuId(menuId === template.templateId ? null : template.templateId)}>⋮</button>
            {menuId === template.templateId && (
              <div className="template-menu">
                <button onClick={() => { onEdit(template); setMenuId(null); }}>편집하기</button>
                <button disabled={saving} onClick={() => remove(template.templateId)}>삭제하기</button>
              </div>
            )}
          </div>
        </div>
      ))}
      {!authenticated ? <div className="templates-empty">로그인 후 템플릿을 확인할 수 있어요.</div>
        : error ? <div className="templates-empty" role="alert">{error}<button onClick={onRetry}>다시 시도</button></div>
        : loading ? <div className="templates-empty" role="status">템플릿을 불러오고 있어요.</div>
        : !templates.length && <TemplateEmptyState searching={Boolean(query)} />}
    </div>
  );
}
