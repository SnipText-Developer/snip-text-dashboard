import { Template } from "models/template";

export type TemplateDraft = Pick<Template, "title" | "shortcut" | "content"> & {
  templateId: number | null;
};
