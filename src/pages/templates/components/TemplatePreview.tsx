import "./TemplatePreview.css";
import { Template } from "models/template";

interface TemplatePreviewProps {
  template?: Template;
  error?: string;
  onClose: () => void;
  onEdit: (template: Template) => void;
  onCopy: (template: Template) => void;
}

export default function TemplatePreview({ template, error, onClose, onEdit, onCopy }: TemplatePreviewProps) {
  return (
    <aside className="template-preview" aria-label="템플릿 미리보기">
      <div className="preview-top">
        <strong>템플릿 미리보기</strong>
        <button className="preview-close" aria-label="미리보기 닫기" onClick={onClose}>×</button>
      </div>
      {template ? <>
        <div className="preview-title"><h2>{template.title}</h2><span>{template.shortcut}</span></div>
        <div className="preview-section"><h3>내용</h3><p className="preview-body">{template.content}</p></div>
        <div className="preview-section preview-variables">
          <h3>변수 {template.variables.length}개</h3>
          {template.variables.map(variable => <div className="preview-variable" key={variable}><strong>{variable}</strong><span>필수</span></div>)}
          {!template.variables.length && <p className="no-variables">등록된 변수가 없어요.</p>}
        </div>
        <div className="preview-actions">
          <button onClick={() => onEdit(template)}>편집하기</button>
          <button onClick={() => onCopy(template)}>복사하기</button>
        </div>
      </> : <p role={error ? "alert" : "status"}>{error || "템플릿을 불러오고 있어요."}</p>}
    </aside>
  );
}
