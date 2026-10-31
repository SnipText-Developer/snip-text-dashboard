import "./TemplateGallery.css";
import { useEffect, useMemo, useRef, useState } from "react";
import GalleryTemplateCard from "./GalleryTemplateCard";
import GalleryTemplateDetail from "./GalleryTemplateDetail";
import {
  filterGalleryTemplates,
  galleryCategoryTabs,
  groupGalleryTemplatesByCategory,
} from "../filterGalleryTemplates";
import { GalleryCategoryFilter, GalleryTemplate } from "../types";
import searchIcon from "assets/icons/search.svg";

const PAGE_SIZE = 20;

interface TemplateGalleryProps {
  templates: GalleryTemplate[];
  // 내 템플릿에 저장하는 중이면 추가 버튼을 비활성화합니다.
  saving?: boolean;
  // 변수 입력 후 복사합니다. 변수 입력 모달과 클립보드 복사는 상위에서 연결합니다.
  onCopy: (template: GalleryTemplate) => void;
  // {{변수명}}을 치환하지 않고 그대로 내 템플릿에 추가합니다.
  onAddToMyTemplates: (template: GalleryTemplate) => void;
}

/**
 * 템플릿 갤러리 화면(#tempgallery)의 UI 컴포넌트입니다.
 * 목록은 카테고리 섹션으로 묶어 보여주고, 상세 보기 시 왼쪽 목록 + 오른쪽 상세로 전환합니다.
 * 카테고리·검색 필터는 화면에서 적용하고 무한 스크롤로 나눠 렌더링합니다.
 */
export default function TemplateGallery({
  templates,
  saving = false,
  onCopy,
  onAddToMyTemplates,
}: TemplateGalleryProps) {
  const [category, setCategory] = useState<GalleryCategoryFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedTemplate, setSelectedTemplate] =
    useState<GalleryTemplate | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // 목록으로 돌아올 때 포커스를 되돌릴 템플릿 ID
  const returnFocusIdRef = useRef<number | null>(null);

  const filteredTemplates = useMemo(
    () => filterGalleryTemplates(templates, category, searchQuery),
    [templates, category, searchQuery]
  );
  const visibleTemplates = filteredTemplates.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTemplates.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category, searchQuery]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!hasMore || !sentinel) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisibleCount(filteredTemplates.length);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((count) => count + PAGE_SIZE);
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, filteredTemplates.length, selectedTemplate]);

  // 목록으로 돌아오면 마지막으로 본 템플릿 카드의 "상세 보기" 버튼으로 포커스를 되돌립니다.
  useEffect(() => {
    const templateId = returnFocusIdRef.current;
    if (selectedTemplate || templateId === null) return;
    returnFocusIdRef.current = null;
    rootRef.current
      ?.querySelector<HTMLButtonElement>(
        `[data-gallery-template-id="${templateId}"] .gallery-card__detail-button`
      )
      ?.focus();
  }, [selectedTemplate]);

  const closeDetail = () => {
    returnFocusIdRef.current = selectedTemplate?.galleryTemplateId ?? null;
    setSelectedTemplate(null);
  };

  const sentinel = hasMore && <div ref={sentinelRef} aria-hidden="true" />;

  const renderList = () => {
    if (filteredTemplates.length === 0) {
      return (
        <div className="template-gallery__empty">
          <p className="template-gallery__empty-title">
            검색된 템플릿이 없어요
          </p>
          <p className="template-gallery__empty-description">
            제목, 본문, 단축어를 입력해보세요
          </p>
        </div>
      );
    }

    return (
      <div className="template-gallery__sections">
        {groupGalleryTemplatesByCategory(visibleTemplates).map((group) => (
          <section key={group.category} className="template-gallery__section">
            <h2 className="template-gallery__section-title">{group.label}</h2>
            <div className="template-gallery__grid">
              {group.templates.map((template) => (
                <GalleryTemplateCard
                  key={template.galleryTemplateId}
                  template={template}
                  onOpen={setSelectedTemplate}
                />
              ))}
            </div>
          </section>
        ))}
        {sentinel}
      </div>
    );
  };

  return (
    <div ref={rootRef} className="template-gallery">
      <header className="template-gallery__header">
        <h1 className="template-gallery__title">템플릿 갤러리</h1>
        <p className="template-gallery__description">
          필요한 문장을 골라 내 템플릿에 바로 추가하세요.
        </p>
      </header>

      {selectedTemplate ? (
        <div className="template-gallery__detail-layout">
          <div className="template-gallery__side-list">
            {visibleTemplates.map((template) => (
              <GalleryTemplateCard
                key={template.galleryTemplateId}
                template={template}
                variant="compact"
                isSelected={
                  template.galleryTemplateId ===
                  selectedTemplate.galleryTemplateId
                }
                onOpen={setSelectedTemplate}
              />
            ))}
            {sentinel}
          </div>
          <GalleryTemplateDetail
            template={selectedTemplate}
            saving={saving}
            onBack={closeDetail}
            onCopy={onCopy}
            onAddToMyTemplates={onAddToMyTemplates}
          />
        </div>
      ) : (
        <>
          <div className="template-gallery__toolbar">
            {/* 목록을 거르는 토글 버튼이므로 tab 역할 대신 aria-pressed를 사용합니다. */}
            <div
              className="template-gallery__tabs"
              role="group"
              aria-label="카테고리 필터"
            >
              {galleryCategoryTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={category === tab.value}
                  className={`template-gallery__tab${
                    category === tab.value ? " is-active" : ""
                  }`}
                  onClick={() => setCategory(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <label className="template-gallery__search">
              <img src={searchIcon} alt="" width={14} height={14} />
              <input
                type="search"
                className="template-gallery__search-input"
                placeholder="템플릿 검색"
                aria-label="템플릿 검색"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>
          </div>
          {renderList()}
        </>
      )}
    </div>
  );
}
