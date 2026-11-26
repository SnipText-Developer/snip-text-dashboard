import { formatShortcut } from "utils/shortcuts";
import "components/template/TemplateSideList.css";
import "./TemplateList.css";
import { useState } from "react";
import { Template } from "models/template";
import Notice from "components/notice/Notice";
import TemplateEmptyState from "./TemplateEmptyState";
import copyIcon from "assets/icons/copy.svg";
import moreIcon from "assets/icons/more.svg";
import editIcon from "assets/icons/menu-edit.svg";
import deleteIcon from "assets/icons/menu-delete.svg";

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
}

export default function TemplateList({ templates, selectedId, saving, authenticated, loading, error, query, onSelect, onCopy, onEdit, onDelete }: TemplateListProps) {
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
            <span className="shortcut-pill">{formatShortcut(template.shortcut)}</span>
            <span className="template-info">
              <strong>{template.title}</strong>
              <span className="template-excerpt">{template.content}</span>
            </span>
          </button>
          <button className="row-copy" onClick={() => onCopy(template)} aria-label={`${template.title} 복사`}><img src={copyIcon} alt="" width={20} height={20} />복사</button>
          <div className="template-more">
            <button className="more-button" aria-label={`${template.title} 더 보기`} aria-expanded={menuId === template.templateId} onClick={() => setMenuId(menuId === template.templateId ? null : template.templateId)}><img src={moreIcon} alt="" width={24} height={24} /></button>
            {menuId === template.templateId && (
              <div className="template-menu">
                <button onClick={() => { onEdit(template); setMenuId(null); }}><img src={editIcon} alt="" width={20} height={20} />편집</button>
                <button className="template-menu-delete" disabled={saving} onClick={() => remove(template.templateId)}><img src={deleteIcon} alt="" width={20} height={20} />삭제</button>
              </div>
            )}
          </div>
        </div>
      ))}
      {!authenticated ? <TemplateEmptyState state="login" />
        : error ? <Notice message={error} placement="inline" tone="error" />
        : loading ? <div className="templates-empty" role="status">템플릿을 불러오고 있어요.</div>
        : !templates.length && <TemplateEmptyState state={query ? "search" : "first"} />}
    </div>
  );
}
