import { useEffect, useRef, useState } from "react";
import correctTone, { CorrectToneResult, ToneStyle } from "api/ai/correctTone";
import createTemplate from "api/template/createTemplate";
import { TemplateDraft } from "pages/templates/types";

export default function useAiTone(accessToken: string) {
  const [text, setText] = useState("");
  const [style, setStyle] = useState<ToneStyle>("CASUAL");
  const [result, setResult] = useState<CorrectToneResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), [accessToken]);

  async function correct() {
    if (pending.current || !text.trim() || text.length > 1000 || !accessToken)
      return;
    pending.current = true;
    setBusy(true);
    setError("");
    const request = new AbortController();
    controller.current = request;
    try {
      const response = await correctTone(
        accessToken,
        { text, style },
        request.signal,
      );
      if (request.signal.aborted) return;
      if (response.isSuccess) setResult(response.result);
      else setError(response.message);
    } catch {
      if (!request.signal.aborted)
        setError("교정하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      pending.current = false;
      if (!request.signal.aborted) setBusy(false);
    }
  }
  function reset() {
    if (pending.current) return;
    setText("");
    setResult(null);
    setError("");
    setNotice("");
  }
  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.correctedText);
      setNotice("교정 결과를 복사했어요.");
    } catch {
      setNotice("복사하지 못했어요. 클립보드 권한을 확인해 주세요.");
    }
  }
  async function save(draft: TemplateDraft) {
    if (saving || !accessToken) return;
    setSaving(true);
    try {
      const response = await createTemplate(accessToken, {
        title: draft.title,
        shortcut: `/${draft.shortcut.trim().replace(/^\/+/, "")}`,
        content: draft.content,
      });
      if (!response.isSuccess) {
        setNotice(response.message);
        return;
      }
      setEditing(false);
      setNotice("내 템플릿에 저장했어요.");
    } catch {
      setNotice("템플릿을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  }
  return {
    text,
    setText,
    style,
    setStyle,
    result,
    busy,
    error,
    notice,
    setNotice,
    editing,
    setEditing,
    saving,
    correct,
    reset,
    copy,
    save,
  };
}
