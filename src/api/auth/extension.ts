import { sendExtensionMessage } from "utils/extensionMessaging";

type ExtensionTokenMessage = {
  dst: "BACKGROUND";
  path: "/auth/token";
} & (
  | { method: "PUT"; data: { vendor: "GOOGLE"; token: string } }
  | { method: "DELETE"; data: { vendor: "GOOGLE" } }
);

async function sendTokenMessage(message: ExtensionTokenMessage): Promise<boolean | undefined> {
  const response = await sendExtensionMessage(message);
  if (response === undefined) return;
  return response?.statusCode === 200;
}

let pendingTokenMessage: Promise<boolean | undefined> | undefined;

export function sendAccessTokenToExtension(accessToken: string) {
  pendingTokenMessage = sendTokenMessage({
    dst: "BACKGROUND",
    method: "PUT",
    path: "/auth/token",
    data: { vendor: "GOOGLE", token: accessToken },
  });
  void pendingTokenMessage.then(success => {
    if (success === false) console.warn("SnipText 확장 프로그램에 로그인 상태를 전달하지 못했어요.");
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
