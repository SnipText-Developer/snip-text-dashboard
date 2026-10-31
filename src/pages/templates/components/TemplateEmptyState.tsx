import "./TemplateEmptyState.css";
import TemplateEmptyMessage from "components/template/TemplateEmptyMessage";

interface TemplateEmptyStateProps {
  searching: boolean;
}

export default function TemplateEmptyState({ searching }: TemplateEmptyStateProps) {
  return (
    <TemplateEmptyMessage
      className="template-search-empty"
      decoration={<span className="template-search-empty-mark" aria-hidden="true" />}
      title={searching ? "검색된 템플릿이 없어요" : "아직 저장된 템플릿이 없어요"}
      description={searching ? "제목, 본문, 단축어를 다시 입력해보세요" : "새로운 템플릿을 생성하여 빠르게 문장을 완성해보세요"}
    />
  );
}
