import TemplateGallery from "./components/TemplateGallery";
import sampleGalleryTemplates from "./sampleGalleryTemplates";

export default function TemplateGalleryPage() {
  // TODO: API 연동 시 useGalleryTemplates 데이터와 복사(변수 입력 모달)·저장 동작을 연결합니다.
  return (
    <TemplateGallery
      templates={sampleGalleryTemplates}
      onCopy={() => {}}
      onAddToMyTemplates={() => {}}
    />
  );
}
