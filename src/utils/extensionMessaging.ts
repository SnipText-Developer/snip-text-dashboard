interface ExtensionMessage {
  dst: "BACKGROUND";
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  data: object;
}

interface ExtensionResponse {
  statusCode: number;
  data?: unknown;
}

interface ExtensionRuntime {
  lastError?: { message?: string };
  sendMessage(
    extensionId: string,
    message: ExtensionMessage,
    callback: (response?: ExtensionResponse) => void,
  ): void;
}

// undefined means messaging is unavailable in this page, and null means sending failed.
export function sendExtensionMessage(message: ExtensionMessage): Promise<ExtensionResponse | null | undefined> {
  const extensionId = process.env.REACT_APP_CHROME_EXTENSION_ID?.trim();
  const runtime = (window as Window & { chrome?: { runtime?: ExtensionRuntime } }).chrome?.runtime;
  if (!extensionId || !/^[a-p]{32}$/.test(extensionId) || !runtime?.sendMessage || window.top !== window) {
    return Promise.resolve(undefined);
  }

  return new Promise(resolve => {
    const timeout = window.setTimeout(() => resolve(null), 2000);
    const finish = (response: ExtensionResponse | null) => {
      window.clearTimeout(timeout);
      resolve(response);
    };

    try {
      runtime.sendMessage(extensionId, message, response => {
        finish(runtime.lastError ? null : response ?? null);
      });
    } catch {
      finish(null);
    }
  });
}

export function requestExtensionTemplateRefresh() {
  return sendExtensionMessage({
    dst: "BACKGROUND",
    method: "POST",
    path: "/template/refresh",
    data: {},
  });
}
