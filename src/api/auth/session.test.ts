import { requestExtensionTemplateRefresh } from "utils/extensionMessaging";
import { clearExtensionAccessToken, getExtensionAccessToken, sendAccessTokenToExtension } from "./extension";
import { apiFetch, getSessionToken, loginWithGoogle, logout, restoreSession, signUpWithGoogle } from "./session";

jest.mock("./extension");
jest.mock("utils/extensionMessaging");

const redirectUri = "http://localhost:3000/dashboard/auth/google/callback";
const credentials = { code: "google-code", codeVerifier: "verifier", redirectUri };
const response = (status: number, data: object) => ({
  ok: status < 400,
  status,
  json: async () => data,
  clone: () => response(status, data),
});
const success = (result: object) => response(200, { isSuccess: true, result });

const originalFetch = global.fetch;
const fetchMock = jest.fn();
const lockRequest = jest.fn();

beforeAll(() => {
  Object.defineProperty(navigator, "locks", { configurable: true, value: { request: lockRequest } });
});

afterAll(() => {
  Reflect.deleteProperty(navigator, "locks");
});

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  global.fetch = fetchMock;
  fetchMock.mockReset();
  jest.clearAllMocks();
  jest.mocked(getExtensionAccessToken).mockReset();
  jest.mocked(sendAccessTokenToExtension).mockReset().mockResolvedValue(false);
  let tail = Promise.resolve();
  lockRequest.mockReset().mockImplementation((_name, callback) => {
    const pending = tail.then(callback);
    tail = pending.then(() => undefined, () => undefined);
    return pending;
  });
});

afterEach(async () => {
  fetchMock.mockResolvedValue(success({}));
  if (getSessionToken()) await logout();
  global.fetch = originalFetch;
});

it("restores the background token once the server confirms it", async () => {
  jest.mocked(getExtensionAccessToken).mockResolvedValue("background-token");
  fetchMock.mockResolvedValueOnce(response(200, { isSuccess: true, code: "USER200_1" }));

  const pending = restoreSession();
  expect(restoreSession()).toBe(pending);
  expect(getSessionToken()).toBe("");
  await pending;

  expect(getSessionToken()).toBe("background-token");
  expect(getExtensionAccessToken).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith("https://api.sniptext.kr/api/v1/users/me", expect.objectContaining({
    headers: { Authorization: "Bearer background-token" },
  }));
  expect(sendAccessTokenToExtension).not.toHaveBeenCalled();
});

it("waits for background registration before exposing a newly logged in session", async () => {
  let confirmRegistration!: (success: boolean) => void;
  let registrationStarted!: () => void;
  const started = new Promise<void>(resolve => { registrationStarted = resolve; });
  jest.mocked(sendAccessTokenToExtension).mockImplementationOnce(() => {
    registrationStarted();
    return new Promise<boolean>(resolve => { confirmRegistration = resolve; });
  });
  fetchMock.mockResolvedValueOnce(success({ accessToken: "member" }));

  const login = loginWithGoogle(credentials);
  await started;
  expect(getSessionToken()).toBe("");
  confirmRegistration(true);
  await login;
  expect(getSessionToken()).toBe("member");
});

it.each([false, true])("restores after reload when background registration reports %s but cannot read the token", async registered => {
  jest.mocked(sendAccessTokenToExtension).mockResolvedValue(registered);
  fetchMock.mockResolvedValueOnce(success({ accessToken: "member" }));
  await loginWithGoogle(credentials);

  let reloaded!: typeof import("./session");
  jest.isolateModules(() => { reloaded = require("./session"); });
  expect(reloaded.getSessionToken()).toBe("");
  fetchMock.mockResolvedValueOnce(response(200, { isSuccess: true, code: "USER200_1" }));

  await reloaded.restoreSession();

  expect(reloaded.getSessionToken()).toBe("member");
  expect(fetchMock).toHaveBeenLastCalledWith("https://api.sniptext.kr/api/v1/users/me", expect.objectContaining({
    headers: { Authorization: "Bearer member" },
  }));
});

it("keeps the token only in background when it can be read back successfully", async () => {
  jest.mocked(sendAccessTokenToExtension).mockResolvedValue(true);
  jest.mocked(getExtensionAccessToken).mockResolvedValue("member");
  fetchMock.mockResolvedValueOnce(success({ accessToken: "member" }));

  await loginWithGoogle(credentials);

  expect(sessionStorage.getItem("sniptext.tabAccessToken")).toBeNull();
});

it("clears the tab token as soon as logout starts", async () => {
  fetchMock.mockResolvedValueOnce(success({ accessToken: "member" }));
  await loginWithGoogle(credentials);
  expect(sessionStorage.getItem("sniptext.tabAccessToken")).toBe("member");
  fetchMock.mockResolvedValueOnce({ ok: true, status: 204 });

  const pending = logout();
  expect(sessionStorage.getItem("sniptext.tabAccessToken")).toBeNull();
  expect(localStorage.getItem("sniptext.signedOut")).toBe("1");
  await pending;
});

it("keeps the session signed out when the background token is rejected", async () => {
  jest.mocked(getExtensionAccessToken).mockResolvedValue("expired");
  fetchMock.mockResolvedValueOnce(response(401, { code: "COMMON401_1" }));

  await restoreSession();

  expect(getSessionToken()).toBe("");
});

it("does not restore while the browser is explicitly signed out", async () => {
  localStorage.setItem("sniptext.signedOut", "1");
  await restoreSession();
  expect(getExtensionAccessToken).not.toHaveBeenCalled();
});

it("exchanges a Google code and requires consent before completing a new account", async () => {
  fetchMock.mockResolvedValueOnce(success({ isCompletedSignUp: false, signupToken: "signup", email: "test@example.com" }));
  await expect(loginWithGoogle(credentials)).resolves.toEqual({ signupToken: "signup", email: "test@example.com" });
  expect(getSessionToken()).toBe("");
  expect(sendAccessTokenToExtension).not.toHaveBeenCalled();
  expect(fetchMock).toHaveBeenNthCalledWith(1, "https://api.sniptext.kr/api/v1/auth/login", expect.objectContaining({
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ ...credentials, provider: "GOOGLE" }),
  }));

  fetchMock.mockResolvedValueOnce(success({ isCompletedSignUp: true, accessToken: "member" }));
  await signUpWithGoogle("signup");
  expect(fetchMock).toHaveBeenNthCalledWith(2, "https://api.sniptext.kr/api/v1/auth/signup", expect.objectContaining({
    credentials: "include",
    body: JSON.stringify({ signupToken: "signup", termsAgreed: true }),
  }));
  expect(getSessionToken()).toBe("member");
  expect(sendAccessTokenToExtension).toHaveBeenCalledTimes(1);
  expect(sendAccessTokenToExtension).toHaveBeenCalledWith("member");
});

it("clears the session and returns concurrent expired responses without retrying", async () => {
  fetchMock
    .mockResolvedValueOnce(success({ isCompletedSignUp: true, accessToken: "expired" }))
    .mockResolvedValue(response(401, { code: "COMMON401_1" }));
  await loginWithGoogle(credentials);

  const options = { headers: { Authorization: "Bearer expired" } };
  const results = await Promise.all([
    apiFetch("/api/v1/templates", options),
    apiFetch("/api/v1/users/me", options),
  ]);
  expect(results.map(result => result.status)).toEqual([401, 401]);
  expect(getSessionToken()).toBe("");
  expect(fetchMock).toHaveBeenCalledTimes(3);
  expect(sendAccessTokenToExtension).toHaveBeenCalledTimes(1);
});

it("logs out across tabs when the server endpoint is unavailable", async () => {
  let otherTab!: typeof import("./session");
  jest.isolateModules(() => { otherTab = require("./session"); });
  fetchMock
    .mockResolvedValueOnce(success({ isCompletedSignUp: true, accessToken: "member" }))
    .mockResolvedValueOnce(success({ accessToken: "other-tab-token" }))
    .mockResolvedValueOnce(response(404, { isSuccess: false, code: "COMMON404_1" }));
  jest.mocked(clearExtensionAccessToken).mockResolvedValueOnce(true);

  await loginWithGoogle(credentials);
  await otherTab.loginWithGoogle(credentials);
  expect(otherTab.getSessionToken()).toBe("other-tab-token");

  const first = logout();
  expect(logout()).toBe(first);
  await expect(first).resolves.toEqual({ serverEnded: false, extensionCleared: true });
  expect(getSessionToken()).toBe("");
  expect(clearExtensionAccessToken).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenNthCalledWith(3, "https://api.sniptext.kr/api/v1/auth/logout", expect.objectContaining({
    credentials: "include",
    headers: expect.any(Headers),
    method: "POST",
  }));
  expect(fetchMock.mock.calls[2][1].headers.get("Authorization")).toBe("Bearer member");

  window.dispatchEvent(new StorageEvent("storage", { key: "sniptext.signedOut", newValue: "1" }));
  expect(otherTab.getSessionToken()).toBe("");
  await expect(apiFetch("/api/v1/templates", { headers: { Authorization: "Bearer member" } }))
    .rejects.toMatchObject({ status: 401 });
  expect(fetchMock).toHaveBeenCalledTimes(3);

  fetchMock.mockResolvedValueOnce(success({ isCompletedSignUp: true, accessToken: "new-session" }));
  await loginWithGoogle(credentials);
  expect(getSessionToken()).toBe("new-session");
  expect(localStorage.getItem("sniptext.signedOut")).toBeNull();
});

it("accepts an empty 204 as a successful server logout", async () => {
  fetchMock
    .mockResolvedValueOnce(success({ isCompletedSignUp: true, accessToken: "member" }))
    .mockResolvedValueOnce({ ok: true, status: 204 });

  await loginWithGoogle(credentials);
  await expect(logout()).resolves.toMatchObject({ serverEnded: true });
  expect(getSessionToken()).toBe("");
});

it.each([
  ["POST", "/api/v1/templates", 201, true],
  ["PUT", "/api/v1/templates/4", 200, true],
  ["DELETE", "/api/v1/templates/4", 200, false],
  ["POST", "/api/v1/gallery/templates/4/save", 201, true],
  ["POST", "/api/v1/trash/templates/4/restore", 200, true],
  ["DELETE", "/api/v1/trash/templates", 200, true],
  ["GET", "/api/v1/templates", 200, false],
  ["GET", "/api/v1/gallery/templates/4", 200, false],
  ["POST", "/api/v1/templates", 409, false],
  ["POST", "/api/v1/ai/tone-corrections", 200, false],
])("handles template refresh notification for %s %s (%i)", async (method, path, status, notifies) => {
  const result = response(status, {});
  fetchMock.mockResolvedValueOnce(result);

  await expect(apiFetch(path, { method })).resolves.toBe(result);

  if (notifies) {
    expect(requestExtensionTemplateRefresh).toHaveBeenCalledTimes(1);
  } else {
    expect(requestExtensionTemplateRefresh).not.toHaveBeenCalled();
  }
});
