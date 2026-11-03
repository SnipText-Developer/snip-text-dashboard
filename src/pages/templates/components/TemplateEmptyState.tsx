import "./TemplateEmptyState.css";
import TemplateEmptyMessage from "components/template/TemplateEmptyMessage";

interface TemplateEmptyStateProps {
  searching: boolean;
}

export default function TemplateEmptyState({ searching }: TemplateEmptyStateProps) {
  return (
    <TemplateEmptyMessage
      className={searching ? "template-search-empty" : "template-search-empty template-first-empty"}
      decoration={searching ? <span className="template-search-empty-mark" aria-hidden="true" /> : undefined}
      title={searching ? "검색된 템플릿이 없어요" : "첫 템플릿을 만들어 시작하세요"}
      description={searching ? "제목, 본문, 단축어를 다시 입력해보세요" : "자주 사용하는 문장을 저장하면 필요할 때 단축어로 바로 불러올 수 있어요."}
    />
  );
}
