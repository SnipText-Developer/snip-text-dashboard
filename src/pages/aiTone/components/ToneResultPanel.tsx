import { CorrectToneResult } from "api/ai/correctTone";

interface ToneResultPanelProps {
  result: CorrectToneResult | null;
  busy: boolean;
  authenticated: boolean;
  onCopy: () => void;
  onSave: () => void;
}

export default function ToneResultPanel({ result, busy, authenticated, onCopy, onSave }: ToneResultPanelProps) {
  return (
        <div className="ai-tone-panel" aria-busy={busy}>
          <div className="ai-tone-label"><label htmlFor="ai-tone-result">교정 결과</label></div>
          <textarea id="ai-tone-result" readOnly value={result?.correctedText ?? ""} placeholder={busy ? "문장을 다듬고 있어요…" : "교정 결과가 여기에 표시됩니다."} />
          <div className="ai-tone-panel-footer ai-tone-result-footer"><div className="ai-tone-actions">
            <button type="button" disabled={!result || busy} onClick={onCopy}>복사</button>
            <button type="button" disabled={!result || busy || !authenticated} onClick={onSave}>내 템플릿에 저장</button>
          </div></div>
        </div>
  );
}
