import { requestExtensionTemplateRefresh } from "utils/extensionMessaging";

export default async function fetchTemplateMutation(path: string, options: RequestInit) {
  const response = await fetch(path, options);
  if (response.ok) void requestExtensionTemplateRefresh();
  return response;
}
