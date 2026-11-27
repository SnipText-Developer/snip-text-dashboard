import { ToneStyle } from "api/ai/correctTone";

const styles: { label: string; value: ToneStyle }[] = [
  { label: "상사 / 외부용", value: "BOSS_EXTERNAL" },
  { label: "보고 / 공문용", value: "REPORT_OFFICIAL" },
  { label: "마케팅 / 설득", value: "MARKETING" },
  { label: "공지 / 안내", value: "NOTICE" },
  { label: "부드러운 존댓말", value: "SOFT_POLITE" },
  { label: "편한 반말", value: "CASUAL" },
];

interface ToneStyleSelectorProps {
  style: ToneStyle;
  busy: boolean;
  onChange: (style: ToneStyle) => void;
}

export default function ToneStyleSelector({ style: selectedStyle, busy, onChange }: ToneStyleSelectorProps) {
  return (
    <fieldset className="ai-tone-styles" disabled={busy}>
      <legend>문체 선택</legend>
      <div>{styles.map(style => (
        <button type="button" key={style.value} aria-pressed={selectedStyle === style.value}
          onClick={() => onChange(style.value)}>{style.label}</button>
      ))}</div>
    </fieldset>
  );
}
