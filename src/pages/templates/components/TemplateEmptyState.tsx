import "components/notice/StatusPanel.css";
import "./TemplateEmptyState.css";

const messages = {
  login: { title: "로그인 후 템플릿을 확인할 수 있어요.", description: "" },
  first: {
    title: "첫 템플릿을 만들어 시작하세요",
    description: "자주 사용하는 문장을 저장하면 필요할 때 단축어로 바로 불러올 수 있어요.",
  },
  search: {
    title: "검색된 템플릿이 없어요",
    description: "제목, 본문, 단축어를 다시 입력해보세요",
  },
};

export default function TemplateEmptyState({ state }: { state: keyof typeof messages }) {
  const { title, description } = messages[state];
  const className = state === "first" ? "template-first-empty" : `status-panel template-${state}-empty`;

  return (
    <div className={className} role="status">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
