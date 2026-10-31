import { useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams, useOutletContext } from "react-router-dom";

import useTemplates from "customHooks/template/useTemplates";
import useTemplateDetail from "customHooks/template/useTemplateDetail";
import createTemplate from "api/template/createTemplate";
import updateTemplate from "api/template/updateTemplate";
import deleteTemplate from "api/template/deleteTemplate";

import { Template } from "models/template";
import { TemplateDraft } from "../types";
export default function useTemplatesPage() {
  const { query = "", accessToken = "" } = useOutletContext<{ query: string; accessToken?: string }>();
  const { data, error, refetch } = useTemplates(accessToken);
  const templates = accessToken && !error && data?.isSuccess ? data.result.templates : [];
  const navigate = useNavigate();
  const location = useLocation();
  const { templateId: editingTemplateId } = useParams();
  const [searchParams] = useSearchParams();
  const templateId = location.pathname.endsWith("/edit") ? editingTemplateId : searchParams.get("template");
  const selectedId = templateId && /^\d+$/.test(templateId) && Number.isSafeInteger(Number(templateId)) ? Number(templateId) : null;
  const creating = location.pathname === "/templates/new";
  const editingRoute = location.pathname.endsWith("/edit");
  const open = (path: string) => navigate(path, { state: { templatesOrigin: location.pathname + location.search } });
  const close = () => {
    if (saving) return;
    const origin = location.state?.templatesOrigin;
    if (typeof origin === "string" && (origin.split("?")[0] === "/" || origin.split("?")[0] === "/templates")) navigate(-1);
    else if (!creating && !editingRoute) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("template");
      navigate({ pathname: location.pathname, search: nextParams.toString() }, { replace: true });
    } else navigate("/templates", { replace: true });
  };
  const detail = useTemplateDetail(accessToken, selectedId);
  const [saving, setSaving] = useState(false);
  const [copyingTemplate, setCopyingTemplate] = useState<Template | null>(null);
  const [notice, setNotice] = useState("");
  const selected = accessToken && !detail.error && detail.data?.isSuccess && detail.data.result.templateId === selectedId ? detail.data.result : undefined;
  const editing: TemplateDraft | null = creating
    ? { templateId: null, title: "", shortcut: "", content: "" }
    : editingRoute && selected ? selected : null;
  const filtered = templates.filter(template => `${template.title} ${template.shortcut} ${template.content}`.toLowerCase().includes(query.toLowerCase()));

  function copy(template: Template) {
    if (template.variables.length) {
      setCopyingTemplate(template);
      return;
    }
    copyContent(template.title, template.content);
  }
  async function copyContent(title: string, content: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(content);
      setNotice(`‘${title}’ 내용을 복사했어요.`);
      return true;
    } catch {
      setNotice("복사하지 못했어요. 브라우저의 클립보드 권한을 확인해 주세요.");
      return false;
    }
  }
  async function save(draft: TemplateDraft, keepPreview = false): Promise<boolean> {
    if (saving || !accessToken) return false;
    setSaving(true);
    try {
      const input = { title: draft.title, shortcut: `/${draft.shortcut.trim().replace(/^\/+/, "")}`, content: draft.content };
      const response = draft.templateId === null
        ? await createTemplate(accessToken, input)
        : await updateTemplate(accessToken, draft.templateId, input);
      if (!response.isSuccess) { setNotice(response.message); return false; }
      if (keepPreview) detail.refetch();
      else navigate("/templates", { replace: true });
      refetch();
      setNotice("템플릿을 저장했어요.");
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "템플릿을 저장하지 못했어요.");
      return false;
    } finally { setSaving(false); }
  }
  async function remove(templateId: number) {
    if (saving || !accessToken) return;
    setSaving(true);
    try {
      const response = await deleteTemplate(accessToken, templateId);
      if (!response.isSuccess) { setNotice(response.message); return; }
      if (selectedId === templateId) navigate("/templates", { replace: true });
      refetch();
      setNotice("템플릿을 휴지통으로 옮겼어요.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "템플릿을 삭제하지 못했어요.");
    } finally { setSaving(false); }
  }
  return {
    hasPreview: selectedId !== null,
    editing,
    copyingTemplate,
    copyDialogProps: {
      onClose: () => setCopyingTemplate(null),
      onCopy: (content: string) => copyingTemplate ? copyContent(copyingTemplate.title, content) : Promise.resolve(false),
    },
    headerProps: {
      count: data?.isSuccess && accessToken && !error ? data.result.totalCount : 0,
      disabled: !accessToken || saving,
      onCreate: () => open("/templates/new"),
    },
    listProps: {
      templates: filtered,
      selectedId,
      saving,
      authenticated: Boolean(accessToken),
      loading: !data,
      error: error?.message || (data?.isSuccess === false ? data.message : undefined),
      query,
      onSelect: (id: number) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("template", String(id));
        open(`${location.pathname}?${nextParams.toString()}`);
      },
      onCopy: copy,
      onEdit: (template: Template) => open(`/templates/${template.templateId}/edit`),
      onDelete: remove,
      onRetry: refetch,
    },
    previewVisible: selectedId !== null,
    previewProps: {
      template: selected,
      error: detail.error?.message || (detail.data?.isSuccess === false ? detail.data.message : undefined),
      onClose: close,
      saving,
      onSave: (draft: TemplateDraft) => save(draft, true),
      onDelete: remove,
      onCopy: copy,
    },
    noticeProps: { message: notice, onClose: () => setNotice("") },
    editorProps: { saving, onClose: close, onSave: async (draft: TemplateDraft) => { await save(draft); } },
  };
}
