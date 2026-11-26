import { requestExtensionTemplateRefresh } from "utils/extensionMessaging";
import { clearExtensionAccessToken, getExtensionAccessToken, sendAccessTokenToExtension } from "./extension";

const extensionId = "deijpelidjmefllaonjkdcndkologogo";
const sendMessage = jest.fn();
const runtime: { sendMessage: typeof sendMessage; lastError?: { message: string } } = { sendMessage };
const originalChrome = Object.getOwnPropertyDescriptor(window, "chrome");

beforeEach(() => {
  Object.defineProperty(window, "chrome", { configurable: true, value: { runtime } });
  sendMessage.mockReset().mockImplementation((_id, _message, callback) => callback({ statusCode: 200 }));
  delete runtime.lastError;
});

afterEach(() => {
  if (originalChrome) Object.defineProperty(window, "chrome", originalChrome);
  else Reflect.deleteProperty(window, "chrome");
  jest.restoreAllMocks();
});

it("sends the access token directly to the configured extension background", () => {
  sendAccessTokenToExtension("access-token");

  expect(sendMessage).toHaveBeenCalledWith(extensionId, {
    dst: "BACKGROUND",
    method: "PUT",
    path: "/auth/token",
    data: { vendor: "GOOGLE", token: "access-token" },
  }, expect.any(Function));
});

it("reads the Google token from the extension background", async () => {
  sendMessage.mockImplementationOnce((_id, _message, callback) => {
    callback({ statusCode: 200, data: { vendor: "GOOGLE", token: "access-token" } });
  });

  await expect(getExtensionAccessToken()).resolves.toBe("access-token");
  expect(sendMessage).toHaveBeenCalledWith(extensionId, {
    dst: "BACKGROUND",
    method: "GET",
    path: "/auth/token",
    data: { vendor: "GOOGLE" },
  }, expect.any(Function));
});

it("sends the JWT expiry to the background for token retention", async () => {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const payload = btoa(JSON.stringify({ exp })).replace(/=+$/, "");
  const token = `header.${payload}.signature`;

  await sendAccessTokenToExtension(token);

  expect(sendMessage).toHaveBeenCalledWith(extensionId, expect.objectContaining({
    data: { vendor: "GOOGLE", token, expiresAt: exp * 1000 },
  }), expect.any(Function));
});

it("reports messaging as unavailable when the Chrome runtime is missing", async () => {
  Object.defineProperty(window, "chrome", { configurable: true, value: {} });

  await expect(requestExtensionTemplateRefresh()).resolves.toBeUndefined();
  expect(sendMessage).not.toHaveBeenCalled();
});

it("handles an unavailable extension without exposing the token", async () => {
  const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
  sendMessage.mockImplementation((_id, _message, callback) => {
    runtime.lastError = { message: "Could not establish connection" };
    callback();
  });

  expect(() => sendAccessTokenToExtension("access-token")).not.toThrow();
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(warn.mock.calls).toEqual([["SnipText 확장 프로그램에 로그인 상태를 전달하지 못했어요."]]);
});

it("deletes the Google token from the same extension after registration completes", async () => {
  let confirmRegistration!: (response: { statusCode: number }) => void;
  sendMessage.mockImplementationOnce((_id, _message, callback) => { confirmRegistration = callback; });
  sendAccessTokenToExtension("access-token");

  const deletion = clearExtensionAccessToken();
  expect(sendMessage).toHaveBeenCalledTimes(1);
  confirmRegistration({ statusCode: 200 });
  await expect(deletion).resolves.toBe(true);
  expect(sendMessage).toHaveBeenLastCalledWith(extensionId, {
    dst: "BACKGROUND",
    method: "DELETE",
    path: "/auth/token",
    data: { vendor: "GOOGLE" },
  }, expect.any(Function));
});

it("requests a template refresh from the configured extension background", async () => {
  await expect(requestExtensionTemplateRefresh()).resolves.toEqual({ statusCode: 200 });
  expect(sendMessage).toHaveBeenCalledWith(extensionId, {
    dst: "BACKGROUND", method: "POST", path: "/template/refresh", data: {},
  }, expect.any(Function));
});
