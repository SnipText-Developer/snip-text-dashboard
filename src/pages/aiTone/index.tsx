import { useOutletContext } from "react-router-dom";
import useAiTone from "customHooks/ai/useAiTone";
import Notice from "components/notice/Notice";
import TemplateEditor from "pages/templates/components/TemplateEditor";
import ToneStyleSelector from "./components/ToneStyleSelector";
import ToneSourcePanel from "./components/ToneSourcePanel";
import ToneResultPanel from "./components/ToneResultPanel";
import ToneFeedback from "./components/ToneFeedback";
import "./aiTone.css";

export default function AiTonePage() {
  const { accessToken = "" } = useOutletContext<{ accessToken?: string }>();
  const page = useAiTone(accessToken);
  return <>
    {page.editing && page.result ? <TemplateEditor
      initialDraft={{ templateId: null, title: "", shortcut: "", content: page.result.correctedText }}
      saving={page.saving} onClose={() => { if (!page.saving) page.setEditing(false); }} onSave={page.save}
    /> : <section className="ai-tone" aria-labelledby="ai-tone-heading">
      <h1 id="ai-tone-heading">AI 톤 교정</h1>
      <p className="ai-tone-description">문장의 의미는 유지하고 상황에 맞는 말투로 자연스럽게 다듬어보세요.</p>
      <ToneStyleSelector style={page.style} busy={page.busy} onChange={page.setStyle} />
      <div className="ai-tone-columns">
        <ToneSourcePanel
          text={page.text} busy={page.busy} authenticated={Boolean(accessToken)} hasResult={Boolean(page.result)}
          onChange={page.setText} onReset={page.reset} onCorrect={page.correct}
        />
        <ToneResultPanel
          result={page.result} busy={page.busy} authenticated={Boolean(accessToken)}
          onCopy={page.copy} onSave={() => page.setEditing(true)}
        />
      </div>
      <ToneFeedback authenticated={Boolean(accessToken)} error={page.error} result={page.result} />
    </section>}
    <Notice message={page.notice} onClose={() => page.setNotice("")} />
  </>;
}
