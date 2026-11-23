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

const CHROME_EXTENSION_ID = "deijpelidjmefllaonjkdcndkologogo";

// undefined means messaging is unavailable in this page, and null means sending failed.
export function sendExtensionMessage(message: ExtensionMessage): Promise<ExtensionResponse | null | undefined> {
  const runtime = (window as Window & { chrome?: { runtime?: ExtensionRuntime } }).chrome?.runtime;
  if (!runtime?.sendMessage || window.top !== window) {
    return Promise.resolve(undefined);
  }

  return new Promise(resolve => {
    const timeout = window.setTimeout(() => resolve(null), 2000);
    const finish = (response: ExtensionResponse | null) => {
      window.clearTimeout(timeout);
      resolve(response);
    };

    try {
      runtime.sendMessage(CHROME_EXTENSION_ID, message, response => {
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
