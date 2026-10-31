import "./GalleryTemplateCard.css";
import { GalleryTemplate } from "../types";

interface GalleryTemplateCardProps {
  template: GalleryTemplate;
  // compact: 상세 화면 왼쪽 목록용 카드
  variant?: "default" | "compact";
  isSelected?: boolean;
  onOpen: (template: GalleryTemplate) => void;
}

/**
 * 갤러리 카드입니다. (GAL-04)
 * 별도 설명 문구 없이 content를 본문 미리보기로 표시합니다.
 */
export default function GalleryTemplateCard({
  template,
  variant = "default",
  isSelected = false,
  onOpen,
}: GalleryTemplateCardProps) {
  if (variant === "compact") {
    return (
      <button
        type="button"
        className={`gallery-card gallery-card--compact${
          isSelected ? " is-selected" : ""
        }`}
        aria-current={isSelected ? "true" : undefined}
        onClick={() => onOpen(template)}
      >
        <span className="gallery-card__title">{template.title}</span>
        <span className="gallery-card__content">{template.content}</span>
      </button>
    );
  }

  return (
    <article
      className="gallery-card"
      data-gallery-template-id={template.galleryTemplateId}
    >
      <h3 className="gallery-card__title">{template.title}</h3>
      <p className="gallery-card__content">{template.content}</p>
      <button
        type="button"
        className="gallery-card__detail-button"
        aria-label={`${template.title} 상세 보기`}
        onClick={() => onOpen(template)}
      >
        상세 보기
      </button>
    </article>
  );
}
