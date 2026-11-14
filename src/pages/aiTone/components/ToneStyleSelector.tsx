import { ToneStyle } from "api/ai/correctTone";

const styles: { label: string; value: ToneStyle }[] = [
  { label: "친근하게", value: "CASUAL" },
  { label: "정중하게", value: "SOFT_POLITE" },
  { label: "공지·안내", value: "NOTICE" },
  { label: "전문적인", value: "REPORT_OFFICIAL" },
];

interface ToneStyleSelectorProps {
  style: ToneStyle;
  busy: boolean;
  onChange: (style: ToneStyle) => void;
}

export default function ToneStyleSelector({ style: selectedStyle, busy, onChange }: ToneStyleSelectorProps) {
  return (
    <fieldset className="ai-tone-styles" disabled={busy}>
      <legend>변경할 톤을 선택하세요</legend>
      <div>{styles.map(style => (
        <button type="button" key={style.value} aria-pressed={selectedStyle === style.value}
          onClick={() => onChange(style.value)}>{style.label}</button>
      ))}</div>
    </fieldset>
  );
}
