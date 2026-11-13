import { GalleryTemplate } from "../types";
import TemplateDetail from "components/template/TemplateDetail";

interface GalleryTemplateDetailProps {
  template: GalleryTemplate;
  saving: boolean;
  onBack: () => void;
  onCopy: (template: GalleryTemplate) => void;
  onAddToMyTemplates: (template: GalleryTemplate) => void;
}

export default function GalleryTemplateDetail({ template, saving, onBack, onCopy, onAddToMyTemplates }: GalleryTemplateDetailProps) {
  return (
    <TemplateDetail
      className="gallery-template-detail"
      label="갤러리 템플릿 상세"
      backLabel="목록으로 돌아가기"
      onBack={onBack}
      title={template.title}
      shortcut={template.shortcut}
      content={template.content}
      variables={template.variables}
      focusTitle
      actions={<>
        <button type="button" onClick={() => onCopy(template)}>복사</button>
        <button type="button" disabled={saving} onClick={() => onAddToMyTemplates(template)}>내 템플릿에 추가</button>
      </>}
    />
  );
}
