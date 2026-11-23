import { loginWithGoogle } from "./session";

export const googleCallbackPath = "/auth/google/callback";
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID?.trim() ||
  "164905697149-1ddv7or5qhcha44isoakjq5ksag4sfq0.apps.googleusercontent.com";
const origins = ["https://sniptext.kr", "http://localhost:3000"];
const transactionKey = "sniptext.googleOAuth";

function getRedirectUri() {
  const { origin } = window.location;
  if (!origins.includes(origin)) {
    throw new Error("sniptext.kr 또는 localhost:3000에서 구글 로그인을 시작해 주세요.");
  }
  return origin + googleCallbackPath;
}

function toBase64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...Array.from(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function startGoogleLogin() {
  const redirectUri = getRedirectUri();
  const state = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const codeVerifier = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier));

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: toBase64Url(new Uint8Array(digest)),
    code_challenge_method: "S256",
  }).toString();

  sessionStorage.setItem(transactionKey, JSON.stringify({ state, codeVerifier, redirectUri }));
  window.location.assign(url.href);
}

export async function completeGoogleLogin(search: string) {
  const query = new URLSearchParams(search);
  const saved = sessionStorage.getItem(transactionKey);
  const transaction = saved ? JSON.parse(saved) : null;
  const redirectUri = getRedirectUri();

  if (!transaction?.state || transaction.state !== query.get("state") ||
      transaction.redirectUri !== redirectUri || typeof transaction.codeVerifier !== "string") {
    throw new Error("구글 로그인 요청을 확인할 수 없어요. 다시 로그인해 주세요.");
  }

  sessionStorage.removeItem(transactionKey);
  const code = query.get("code");
  if (query.has("error") || !code) {
    throw new Error("구글 로그인을 완료하지 못했어요. 다시 시도해 주세요.");
  }

  return loginWithGoogle({ code, codeVerifier: transaction.codeVerifier, redirectUri });
}
