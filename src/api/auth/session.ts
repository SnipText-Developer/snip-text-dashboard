import { apiBaseUrl } from "config";
import { requestExtensionTemplateRefresh } from "utils/extensionMessaging";
import { FetchError } from "models/errorType";
import { clearExtensionAccessToken, getExtensionAccessToken, sendAccessTokenToExtension } from "./extension";

const apiPathPrefix = "/api/v1/";

type AuthAction = "login" | "signup" | "logout";

const signedOutKey = "sniptext.signedOut";
const tabAccessTokenKey = "sniptext.tabAccessToken";

function readTabAccessToken() {
  try {
    return window.sessionStorage.getItem(tabAccessTokenKey) ?? "";
  } catch {
    return "";
  }
}

function rememberTabAccessToken(token = "") {
  try {
    if (token) window.sessionStorage.setItem(tabAccessTokenKey, token);
    else window.sessionStorage.removeItem(tabAccessTokenKey);
  } catch {
    // The current page can still log in when tab storage is unavailable.
  }
}

function isSignedOut() {
  try {
    return window.localStorage.getItem(signedOutKey) === "1";
  } catch {
    return false;
  }
}

function rememberSignOut(signedOut: boolean) {
  try {
    if (signedOut) window.localStorage.setItem(signedOutKey, "1");
    else window.localStorage.removeItem(signedOutKey);
  } catch {
    // This tab can still clear its in-memory session when browser storage is blocked.
  }
}

async function withAuthCookie<T>(request: () => Promise<T>) {
  // Keep cookie rotations serialized until the browser has received the response.
  if (navigator.locks) return navigator.locks.request("sniptext-auth-cookie", request);
  return request();
}

async function sendAuthRequest(
  action: AuthAction, body?: object, accessToken?: string, signal?: AbortSignal,
) {
  const headers = new Headers();
  if (body) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(`${apiBaseUrl}auth/${action}`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers,
    signal,
    body: body && JSON.stringify(body),
  });
  if (action === "logout" && response.status === 204) return;
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.isSuccess !== true) {
    throw new FetchError(response.status, data?.message || "인증 요청에 실패했어요.", data?.code);
  }
  return data?.result;
}

function readAccessToken(result: { accessToken?: unknown } | undefined): string {
  if (typeof result?.accessToken !== "string" || !result.accessToken) {
    throw new Error("인증 응답에서 접근 토큰을 확인할 수 없어요.");
  }
  return result.accessToken;
}

interface Session {
  accessToken: string;
  signingOut?: boolean;
}

let session: Session | undefined;
let restoration: Promise<void> | undefined;
let logoutRequest: Promise<LogoutResult> | undefined;

interface LogoutResult {
  serverEnded: boolean;
  extensionCleared?: boolean;
}
const listeners = new Set<() => void>();

function setSession(accessToken = "") {
  session = accessToken ? { accessToken } : undefined;
  listeners.forEach(listener => listener());
}

window.addEventListener("storage", event => {
  if (event.key === signedOutKey && isSignedOut()) {
    rememberTabAccessToken();
    if (session) setSession();
  }
});

export function subscribeToSession(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getSessionToken() {
  return session?.accessToken ?? "";
}

export function restoreSession() {
  if (session || logoutRequest || isSignedOut()) return Promise.resolve();

  restoration ??= restoreStoredSession()
    .catch(() => {})
    .finally(() => { restoration = undefined; });
  return restoration;
}

async function restoreStoredSession() {
  const backgroundToken = await getExtensionAccessToken();
  const token = backgroundToken ?? readTabAccessToken();
  if (!token || session || logoutRequest || isSignedOut()) return;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  try {
    const response = await apiFetch("/api/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: controller.signal,
    });
    const data = response.ok ? await response.json() : null;
    if (data?.isSuccess === true && data.code === "USER200_1" && !session && !logoutRequest && !isSignedOut()) {
      if (backgroundToken) rememberTabAccessToken();
      setSession(token);
    } else if (response.status === 401 && !backgroundToken && readTabAccessToken() === token) {
      rememberTabAccessToken();
    }
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function loginWithGoogle(body: { code: string; codeVerifier: string; redirectUri: string }) {
  return withAuthCookie(async () => {
    const result = await sendAuthRequest("login", { ...body, provider: "GOOGLE" });
    if (result?.isCompletedSignUp === false) {
      if (typeof result.signupToken !== "string" || !result.signupToken) {
        throw new Error("회원가입 정보를 확인할 수 없어요. 구글 로그인을 다시 시작해 주세요.");
      }
      return { signupToken: result.signupToken, email: typeof result.email === "string" ? result.email : "" };
    }

    await completeLogin(readAccessToken(result));
    return null;
  });
}

export async function signUpWithGoogle(signupToken: string) {
  await withAuthCookie(async () => {
    const result = await sendAuthRequest("signup", { signupToken, termsAgreed: true });
    await completeLogin(readAccessToken(result));
  });
}

async function completeLogin(accessToken: string) {
  const sentToBackground = await sendAccessTokenToExtension(accessToken);
  const savedInBackground = sentToBackground && (await getExtensionAccessToken()) === accessToken;
  if (logoutRequest) return;
  rememberTabAccessToken(savedInBackground ? "" : accessToken);
  rememberSignOut(false);
  setSession(accessToken);
}

async function endServerSession(accessToken?: string) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  try {
    await sendAuthRequest("logout", undefined, accessToken, controller.signal);
    return true;
  } catch (error) {
    return error instanceof FetchError && error.status === 401 && error.code === "AUTH401_5";
  } finally {
    window.clearTimeout(timeout);
  }
}

export function logout() {
  if (logoutRequest) return logoutRequest;
  const tokenAtSignOut = session?.accessToken;
  rememberSignOut(true);
  rememberTabAccessToken();
  if (session) session.signingOut = true;

  logoutRequest = withAuthCookie(async () => {
    const accessToken = session?.accessToken ?? tokenAtSignOut;
    rememberSignOut(true);
    setSession();
    const [serverEnded, extensionCleared] = await Promise.all([
      endServerSession(accessToken),
      clearExtensionAccessToken(),
    ]);
    return { serverEnded, extensionCleared };
  }).finally(() => { logoutRequest = undefined; });
  return logoutRequest;
}

export async function apiFetch(path: string, options?: RequestInit) {
  if (!path.startsWith(apiPathPrefix)) return fetch(path, options);
  const endpoint = path.slice(apiPathPrefix.length);
  const response = await fetchWithSession(`${apiBaseUrl}${endpoint}`, options);
  const method = options?.method?.toUpperCase();
  // deleteTemplate notifies after validating the soft-delete response.
  const isSoftDelete = method === "DELETE" && /^templates\/[^/?]+(?:\?|$)/.test(endpoint);

  if (
    response.ok &&
    !isSoftDelete &&
    (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") &&
    /^(?:templates|trash\/templates|gallery\/templates)(?:[/?]|$)/.test(endpoint)
  ) {
    void requestExtensionTemplateRefresh();
  }

  return response;
}

async function fetchWithSession(url: string, options?: RequestInit) {
  const current = session;
  const headers = new Headers(options?.headers);
  const authorization = headers.get("Authorization");

  if (authorization && (current?.signingOut || isSignedOut())) {
    throw new FetchError(401, "다시 로그인해 주세요.");
  }
  const response = await fetch(url, options);
  if (
    current &&
    authorization === `Bearer ${current.accessToken}` &&
    response.status === 401 &&
    session === current &&
    !current.signingOut &&
    !options?.signal?.aborted
  ) {
    const error = await response.clone().json().catch(() => null);
    if (error?.code === "COMMON401_1" && session === current && !current.signingOut && !options?.signal?.aborted) {
      rememberTabAccessToken();
      setSession();
    }
  }
  return response;
}
