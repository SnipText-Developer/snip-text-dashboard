import { ButtonHTMLAttributes } from "react";
import arrowLeftIcon from "assets/icons/arrow-left.svg";

export default function TemplateBackButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...props}>
      <img src={arrowLeftIcon} alt="" width={24} height={24} />
    </button>
  );
}
