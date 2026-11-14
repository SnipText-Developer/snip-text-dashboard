import { ButtonHTMLAttributes } from "react";
import backIcon from "assets/icons/detail-back.svg";

export default function TemplateBackButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...props}>
      <img src={backIcon} alt="" width={32} height={32} />
    </button>
  );
}
