import { formatShortcut } from "utils/shortcuts";
import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";

import emptyTrash from "api/trash/emptyTrash";
import getTrashTemplates, { TrashTemplate, TrashTemplatesResult } from "api/trash/getTrashTemplates";
import permanentlyDeleteTemplate from "api/trash/permanentlyDeleteTemplate";
import restoreTemplate from "api/trash/restoreTemplate";
import moreIcon from "assets/icons/more.svg";
import Modal from "components/modal/Modal";
import Notice from "components/notice/Notice";
import "components/notice/StatusPanel.css";
import { searchTemplates } from "utils/searchTemplates";
import "./trash.css";

type Action = { type: "restore" | "delete"; id: number } | { type: "empty"; count: number };

const dateFormat = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });

function displayDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.replace(/-/g, ".");
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormat.formatToParts(date)
    .filter(part => part.type !== "literal").map(part => part.value).join(".");
}

export default function TrashPage() {
  const { accessToken = "", query = "" } = useOutletContext<{ accessToken?: string; query?: string }>();
  const [list, setList] = useState<TrashTemplatesResult | null>(null);
  const [request, setRequest] = useState<{ cursor?: string }>({});
  const [loading, setLoading] = useState(Boolean(accessToken));
  const [loadError, setLoadError] = useState("");
  const [menuId, setMenuId] = useState<number | null>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const mutation = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    const controller = new AbortController();
    getTrashTemplates(accessToken, request, controller.signal).then(response => {
      if (controller.signal.aborted) return;
      if (!response.isSuccess) throw new Error(response.message);
      const next = response.result;
      setList(previous => ({
        ...next,
        templates: request.cursor && previous ? [...previous.templates, ...next.templates] : next.templates,
      }));
    }).catch(error => {
      if (!controller.signal.aborted) setLoadError(error.message || "삭제 목록을 불러오지 못했어요.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [accessToken, request]);

  useEffect(() => () => mutation.current?.abort(), [accessToken]);

  function load(cursor?: string) {
    setLoading(true);
    setLoadError("");
    setMenuId(null);
    setRequest({ cursor });
  }

  function confirm(next: Action) {
    setActionError("");
    setMenuId(null);
    setAction(next);
  }

  async function submit() {
    if (!action || !accessToken || mutation.current) return;
    const controller = new AbortController();
    mutation.current = controller;
    setSaving(true);
    setActionError("");
    setNotice("");
    try {
      let message: string;
      if (action.type === "restore") {
        const response = await restoreTemplate(accessToken, action.id, controller.signal);
        if (controller.signal.aborted) return;
        if (!response.isSuccess) {
          if (response.code !== "TRASH404_1") {
            setActionError(response.message);
            return;
          }
          message = response.message;
        } else {
          message = response.result.shortcutChanged
            ? `템플릿을 복구했어요. 단축어가 ${formatShortcut(response.result.shortcut)}(으)로 변경됐어요.`
            : "템플릿을 복구했어요.";
        }
      } else if (action.type === "delete") {
        const response = await permanentlyDeleteTemplate(accessToken, action.id, controller.signal);
        message = response.isSuccess ? "템플릿을 영구 삭제했어요." : response.message;
      } else {
        const response = await emptyTrash(accessToken, controller.signal);
        message = `템플릿 ${response.result.deletedCount}개를 영구 삭제했어요.`;
      }
      if (controller.signal.aborted) return;
      setAction(null);
      setList(null);
      setNotice(message);
      load();
    } catch (error) {
      if (!controller.signal.aborted) {
        setActionError(error instanceof Error ? error.message : "요청을 처리하지 못했어요. 다시 시도해 주세요.");
      }
    } finally {
      mutation.current = null;
      if (!controller.signal.aborted) setSaving(false);
    }
  }

  const templates = searchTemplates(list?.templates ?? [], query);
  const count = list?.totalCount ?? 0;
  const restoring = action?.type === "restore";
  const clearing = action?.type === "empty";

  function renderRow(template: TrashTemplate) {
    const id = template.templateId;
    return (
      <tr key={id}>
        <td>
          {template.shortcut ? (
            <span className="shortcut-pill" title={formatShortcut(template.shortcut)}>{formatShortcut(template.shortcut)}</span>
          ) : "—"}
        </td>
        <th scope="row">{template.title}</th>
        <td><time dateTime={template.deletedAt}>{displayDate(template.deletedAt)}</time></td>
        <td>
          <div className="trash-row-actions">
            <button type="button" className="trash-restore" onClick={() => confirm({ type: "restore", id })}>복구하기</button>
            <div className="trash-menu-anchor"
              onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setMenuId(null); }}
              onKeyDown={event => {
                if (event.key !== "Escape" || menuId !== id) return;
                event.currentTarget.querySelector("button")?.focus();
                setMenuId(null);
              }}>
              <button type="button" className="trash-more" aria-label={`${template.title} 더 보기`}
                aria-expanded={menuId === id} onClick={() => setMenuId(menuId === id ? null : id)}>
                <img src={moreIcon} alt="" width={24} height={24} />
              </button>
              {menuId === id && (
                <button type="button" className="trash-delete" onClick={() => confirm({ type: "delete", id })}>영구 삭제</button>
              )}
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <section className={templates.length ? "trash-page" : "trash-page status-panel-layout"} aria-labelledby="trash-heading">
      <div>
        <header className="templates-heading">
          <div>
            <h1 id="trash-heading">삭제된 템플릿</h1>
            <p className="page-description">삭제된 템플릿은 30일 후 자동으로 영구 삭제됩니다.</p>
          </div>
        </header>
        <div className="trash-toolbar">
          <button type="button" disabled={!count || loading} onClick={() => confirm({ type: "empty", count })}>
            전체 영구 삭제
          </button>
        </div>
        {templates.length > 0 && (
          <table className="trash-table" aria-label="삭제된 템플릿 목록">
            <thead><tr><th scope="col">단축어</th><th scope="col">템플릿 제목</th><th scope="col">삭제일</th><th scope="col" aria-label="작업" /></tr></thead>
            <tbody>{templates.map(renderRow)}</tbody>
          </table>
        )}
      </div>
      {loadError ? (
        <div className="status-panel trash-state" role="alert">
          <span>{loadError}</span>
          <button type="button" onClick={() => load(request.cursor)}>다시 시도</button>
        </div>
      ) : loading ? (
        <p className="status-panel trash-state" role="status">삭제 목록을 불러오는 중이에요.</p>
      ) : templates.length === 0 && (
        <p className="status-panel trash-state">
          {!accessToken ? "로그인하면 삭제된 템플릿을 확인할 수 있어요." :
            count ? (list?.hasNext ? "불러온 목록에 검색 결과가 없어요." : "검색 결과가 없어요.") : "삭제 목록이 비어 있어요"}
        </p>
      )}
      {!loadError && list?.hasNext && list.nextCursor && (
        <button type="button" className="trash-load-more" disabled={loading}
          onClick={() => load(list.nextCursor ?? undefined)}>더 불러오기</button>
      )}
      {action && (
        <Modal variant="confirmation" danger={!restoring}
          title={restoring ? "템플릿을 복구할까요?" : clearing
            ? `템플릿 ${action.count}개를 영구 삭제할까요?` : "템플릿을 영구 삭제할까요?"}
          description={restoring ? "복구한 템플릿은 내 템플릿에서 다시 사용할 수 있어요." : "영구 삭제한 템플릿은 다시 복구할 수 없습니다."}
          submitLabel={restoring ? "복구하기" : clearing ? "전체 영구 삭제" : "영구 삭제"}
          submitDisabled={saving} closeDisabled={saving} error={actionError}
          onClose={() => setAction(null)}
          onSubmit={event => { event.preventDefault(); void submit(); }}
        />
      )}
      <Notice message={notice} onClose={() => setNotice("")} />
    </section>
  );
}
