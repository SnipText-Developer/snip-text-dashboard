import "./TemplatesHeader.css";
import plusIcon from "assets/icons/plus.svg";
interface TemplatesHeaderProps {
  count: number;
  disabled: boolean;
  onCreate: () => void;
}

export default function TemplatesHeader({ disabled, onCreate }: TemplatesHeaderProps) {
  return (
    <>
      <div className="templates-heading">
        <div>
          <h1>내 템플릿</h1>
          <p className="page-description">저장한 문장을 확인하고 필요할 때 바로 사용하세요.</p>
        </div>
        <button className="new-template" disabled={disabled} onClick={onCreate}>
          <img src={plusIcon} alt="" width={20} height={20} />새 템플릿
        </button>
      </div>
    </>
  );
}
