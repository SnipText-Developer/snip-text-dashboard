import { sendExtensionMessage } from "utils/extensionMessaging";

type ExtensionTokenMessage = {
  dst: "BACKGROUND";
  path: "/auth/token";
} & (
  | { method: "PUT"; data: { vendor: "GOOGLE"; token: string; expiresAt?: number } }
  | { method: "DELETE"; data: { vendor: "GOOGLE" } }
);

async function sendTokenMessage(message: ExtensionTokenMessage): Promise<boolean | undefined> {
  const response = await sendExtensionMessage(message);
  if (response === undefined) return;
  return response?.statusCode === 200;
}

let pendingTokenMessage: Promise<boolean | undefined> | undefined;

export async function getExtensionAccessToken() {
  const response = await sendExtensionMessage({
    dst: "BACKGROUND",
    method: "GET",
    path: "/auth/token",
    data: { vendor: "GOOGLE" },
  });
  const data = response?.data;
  if (
    response?.statusCode === 200 && data && typeof data === "object" &&
    "vendor" in data && data.vendor === "GOOGLE" &&
    "token" in data && typeof data.token === "string" && data.token.trim()
  ) {
    return data.token;
  }
}

function getTokenExpiry(accessToken: string): number | undefined {
  const [header, payload, signature] = accessToken.split(".");
  if (!header || !payload || !signature) return;
  try {
    const { exp } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    // This value controls storage retention only. The server validates the token.
    const expiresAt = typeof exp === "number" ? exp * 1000 : NaN;
    if (Number.isSafeInteger(expiresAt) && expiresAt > Date.now()) return expiresAt;
  } catch {
    return;
  }
}

export function sendAccessTokenToExtension(accessToken: string) {
  const expiresAt = getTokenExpiry(accessToken);
  pendingTokenMessage = sendTokenMessage({
    dst: "BACKGROUND",
    method: "PUT",
    path: "/auth/token",
    data: { vendor: "GOOGLE", token: accessToken, ...(expiresAt ? { expiresAt } : {}) },
  });
  return pendingTokenMessage.then(success => {
    if (success === false) console.warn("SnipText 확장 프로그램에 로그인 상태를 전달하지 못했어요.");
    return success === true;
  });
}

export async function clearExtensionAccessToken() {
  await pendingTokenMessage;
  return sendTokenMessage({
    dst: "BACKGROUND",
    method: "DELETE",
    path: "/auth/token",
    data: { vendor: "GOOGLE" },
  });
}
