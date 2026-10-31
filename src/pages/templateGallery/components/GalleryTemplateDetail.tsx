import "./GalleryTemplateDetail.css";
import { useEffect, useRef } from "react";
import { GalleryTemplate } from "../types";
import arrowLeftIcon from "assets/icons/arrow-left.svg";

interface GalleryTemplateDetailProps {
  template: GalleryTemplate;
  saving: boolean;
  onBack: () => void;
  onCopy: (template: GalleryTemplate) => void;
  onAddToMyTemplates: (template: GalleryTemplate) => void;
}

/**
 * 갤러리 템플릿 상세입니다. (GAL-06)
 * 복사·추가 동작은 상위에서 연결합니다.
 */
export default function GalleryTemplateDetail({
  template,
  saving,
  onBack,
  onCopy,
  onAddToMyTemplates,
}: GalleryTemplateDetailProps) {
  const variables = Array.from(new Set(template.variables));
  const titleRef = useRef<HTMLHeadingElement>(null);

  // 상세 화면에 처음 진입할 때만 제목으로 포커스를 옮깁니다. 왼쪽 목록에서 템플릿을 바꿀 때는 옮기지 않습니다.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <section className="gallery-detail" aria-labelledby="gallery-detail-title">
      <button
        type="button"
        className="gallery-detail__back"
        aria-label="목록으로 돌아가기"
        onClick={onBack}
      >
        <img src={arrowLeftIcon} alt="" width={24} height={24} />
      </button>

      <h2
        ref={titleRef}
        id="gallery-detail-title"
        className="gallery-detail__title"
        tabIndex={-1}
      >
        {template.title}
      </h2>

      <p className="gallery-detail__label">내용</p>
      <p className="gallery-detail__content">{template.content}</p>

      {variables.length > 0 && (
        <div className="gallery-detail__variables">
          <span className="gallery-detail__variables-label">포함된 변수</span>
          <ul className="gallery-detail__variable-list">
            {variables.map((variable) => (
              <li key={variable} className="gallery-detail__variable">
                {`{{${variable}}}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="gallery-detail__footer">
        <p className="gallery-detail__hint">
          추가한 뒤 제목·단축어·내용을 수정할 수 있어요.
        </p>
        <div className="gallery-detail__buttons">
          <button
            type="button"
            className="gallery-detail__button"
            onClick={() => onCopy(template)}
          >
            복사하기
          </button>
          <button
            type="button"
            className="gallery-detail__button"
            disabled={saving}
            onClick={() => onAddToMyTemplates(template)}
          >
            내 템플릿에 추가
          </button>
        </div>
      </div>
    </section>
  );
}
