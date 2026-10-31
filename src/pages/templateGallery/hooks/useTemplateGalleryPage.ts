import { useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";

import useTemplates from "customHooks/template/useTemplates";
import saveGalleryTemplate from "api/templateGallery/saveGalleryTemplate";

import { GalleryTemplate } from "../types";

export default function useTemplateGalleryPage() {
  const { accessToken = "" } = useOutletContext<{ accessToken?: string }>();
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const { data, error: templatesError, refetch } = useTemplates(accessToken);
  // 이 화면에서 추가한 갤러리 템플릿 ID. 내 템플릿 목록은 화면에 다시 들어올 때 새로 조회합니다.
  const addedIdsRef = useRef(new Set<number>());
  const [copyingTemplate, setCopyingTemplate] = useState<GalleryTemplate | null>(null);

  function copy(template: GalleryTemplate) {
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

  // 호출할 때마다 새 템플릿이 생성되므로 저장 중에는 다시 요청하지 않습니다.
  async function addToMyTemplates(template: GalleryTemplate) {
    if (saving) return;
    if (!accessToken) {
      setNotice("로그인 후 내 템플릿에 추가할 수 있어요.");
      return;
    }
    // 서버가 출처 정보를 주지 않아 내 템플릿과 내용이 같은지로 중복을 판단합니다.
    if (addedIdsRef.current.has(template.galleryTemplateId)) {
      setNotice("이미 추가한 템플릿입니다.");
      return;
    }
    if (templatesError || data?.isSuccess === false) {
      refetch();
      setNotice("내 템플릿을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.");
      return;
    }
    if (!data) {
      setNotice("내 템플릿을 확인하고 있어요. 잠시 후 다시 시도해 주세요.");
      return;
    }
    if (data.result.templates.some(item => item.content === template.content)) {
      setNotice("이미 추가한 템플릿입니다.");
      return;
    }
    setSaving(true);
    try {
      const response = await saveGalleryTemplate(accessToken, template.galleryTemplateId);
      if (!response.isSuccess) { setNotice(response.message); return; }
      addedIdsRef.current.add(template.galleryTemplateId);
      const { title, shortcut, originalShortcut, shortcutChanged } = response.result;
      setNotice(shortcutChanged
        ? `‘${title}’ 템플릿을 추가했어요. 이미 사용 중인 단축어라 ${originalShortcut} 대신 ${shortcut}로 저장했어요.`
        : `‘${title}’ 템플릿을 내 템플릿에 추가했어요.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "템플릿을 추가하지 못했어요.");
    } finally { setSaving(false); }
  }

  return {
    saving,
    copyingTemplate,
    copyDialogProps: {
      onClose: () => setCopyingTemplate(null),
      onCopy: (content: string) => copyingTemplate ? copyContent(copyingTemplate.title, content) : Promise.resolve(false),
    },
    onCopy: copy,
    onAddToMyTemplates: addToMyTemplates,
    noticeProps: { message: notice, onClose: () => setNotice("") },
  };
}
