import { formatShortcut } from "utils/shortcuts";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";

import saveGalleryTemplate from "api/templateGallery/saveGalleryTemplate";

import { GalleryTemplate } from "../types";

export default function useTemplateGalleryPage() {
  const { query = "", accessToken = "" } = useOutletContext<{ query?: string; accessToken?: string }>();
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [copyingTemplate, setCopyingTemplate] = useState<GalleryTemplate | null>(null);

  function copy(template: GalleryTemplate) {
    if (template.variables.length) {
      setCopyingTemplate(template);
      return;
    }
    copyContent(template.title, template.content);
  }
  async function copyContent(title: string, content: string, inDialog = false): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(content);
      setNotice(`‘${title}’ 내용을 복사했어요.`);
      return true;
    } catch {
      if (!inDialog) setNotice("복사하지 못했어요. 브라우저의 클립보드 권한을 확인해 주세요.");
      return false;
    }
  }

  // 같은 템플릿도 여러 번 저장할 수 있고(GAL-05) 단축어 중복은 서버가 번호를 붙여 처리합니다.
  // 호출할 때마다 새 템플릿이 생성되므로 저장 중에는 다시 요청하지 않습니다.
  async function addToMyTemplates(template: GalleryTemplate) {
    if (saving) return;
    if (!accessToken) {
      setNotice("로그인 후 내 템플릿에 추가할 수 있어요.");
      return;
    }
    setSaving(true);
    try {
      const response = await saveGalleryTemplate(accessToken, template.galleryTemplateId);
      if (!response.isSuccess) {
        // 단축어 동시 충돌(TEMPLATE409_1)은 재시도로 해결되므로 명세의 안내 문구를 씁니다.
        setNotice(response.code === "TEMPLATE409_1" ? "잠시 후 다시 시도해주세요" : response.message);
        return;
      }
      const { title, shortcut, originalShortcut, shortcutChanged } = response.result;
      setNotice(shortcutChanged
        ? `‘${title}’ 템플릿을 추가했어요. 이미 사용 중인 단축어라 ${formatShortcut(originalShortcut)} 대신 ${formatShortcut(shortcut)}로 저장했어요.`
        : `‘${title}’ 템플릿을 내 템플릿에 추가했어요.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "템플릿을 추가하지 못했어요.");
    } finally { setSaving(false); }
  }

  return {
    saving,
    searchQuery: query,
    copyingTemplate,
    copyDialogProps: {
      onClose: () => setCopyingTemplate(null),
      onCopy: (content: string) => copyingTemplate ? copyContent(copyingTemplate.title, content, true) : Promise.resolve(false),
    },
    onCopy: copy,
    onAddToMyTemplates: addToMyTemplates,
    noticeProps: { message: notice, onClose: () => setNotice("") },
  };
}
