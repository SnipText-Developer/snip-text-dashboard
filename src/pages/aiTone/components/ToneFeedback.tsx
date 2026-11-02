import { CorrectToneResult } from "api/ai/correctTone";

interface ToneFeedbackProps {
  authenticated: boolean;
  error: string;
  result: CorrectToneResult | null;
}

export default function ToneFeedback({ authenticated, error, result }: ToneFeedbackProps) {
  return <>
      {!authenticated && <p className="ai-tone-message">로그인 후 AI 톤 교정을 이용할 수 있어요.</p>}
      {error && <p className="ai-tone-error" role="alert">{error}</p>}
      {result && <div className="ai-tone-feedback" aria-live="polite">
        <p className="ai-tone-message">교정 횟수 {result.usage.usedCount} / {result.usage.limit}회 · 남은 횟수 {result.usage.remaining}회</p>
        {result.keyInfoWarning && <div className="ai-tone-warning" role="alert"><p>{result.keyInfoWarning.message}</p>
          {!!result.keyInfoWarning.missingValues.length && <p>누락된 정보: {result.keyInfoWarning.missingValues.join(", ")}</p>}
          {!!result.keyInfoWarning.addedValues.length && <p>추가된 정보: {result.keyInfoWarning.addedValues.join(", ")}</p>}
        </div>}
      </div>}
  </>;
}
