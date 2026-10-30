// 갤러리 타입은 이 파일에서만 가져옵니다. 훅 경로가 바뀌면 이 파일만 수정합니다.
import { GalleryTemplateCategory } from "customHooks/templateGallery/useGalleryTemplates";

export type {
  GalleryTemplate,
  GalleryTemplateCategory,
} from "customHooks/templateGallery/useGalleryTemplates";

export type GalleryCategoryFilter = "ALL" | GalleryTemplateCategory;
