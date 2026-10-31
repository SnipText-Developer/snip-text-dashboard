import "./TemplatesHeader.css";
interface TemplatesHeaderProps {
  count: number;
  disabled: boolean;
  onCreate: () => void;
}

export default function TemplatesHeader({ count, disabled, onCreate }: TemplatesHeaderProps) {
  return (
    <>
      <div className="eyebrow">MY WORKSPACE</div>
      <div className="templates-heading">
        <div>
          <h1>내 템플릿 <span>{count}</span></h1>
          <p className="page-description">자주 쓰는 문구를 저장하고 단축어로 바로 불러오세요.</p>
        </div>
        <button className="new-template" disabled={disabled} onClick={onCreate}>
          <span aria-hidden="true">＋</span> 새 템플릿
        </button>
      </div>
    </>
  );
}
