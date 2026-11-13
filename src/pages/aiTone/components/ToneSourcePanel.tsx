interface ToneSourcePanelProps {
  text: string;
  busy: boolean;
  authenticated: boolean;
  hasResult: boolean;
  onChange: (text: string) => void;
  onReset: () => void;
  onCorrect: () => void;
}

export default function ToneSourcePanel({ text, busy, authenticated, hasResult, onChange, onReset, onCorrect }: ToneSourcePanelProps) {
  return (
        <div className="ai-tone-panel">
          <div className="ai-tone-label"><label htmlFor="ai-tone-source">원문</label><span id="ai-tone-hint">교정할 문장을 입력하세요.</span></div>
          <textarea id="ai-tone-source" aria-describedby="ai-tone-hint ai-tone-count" maxLength={1000} value={text}
            disabled={busy} onChange={event => onChange(event.target.value)} placeholder="교정할 문장을 입력해 주세요." />
          <div className="ai-tone-panel-footer"><span id="ai-tone-count">{text.length.toLocaleString()} / 1,000자</span>
            <div className="ai-tone-actions"><button type="button" disabled={busy || !text} onClick={onReset}>초기화</button>
              <button type="button" disabled={busy || !authenticated || !text.trim()} onClick={onCorrect}>
                {busy ? "교정 중…" : hasResult ? "다시 교정하기" : "톤 교정하기"}</button></div>
          </div>
        </div>
  );
}
