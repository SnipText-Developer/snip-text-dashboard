import { requestExtensionTemplateRefresh } from "utils/extensionMessaging";
import fetchTemplateMutation from "./fetchTemplateMutation";

jest.mock("utils/extensionMessaging");

const originalFetch = global.fetch;
const fetchMock = jest.fn();

beforeEach(() => {
  global.fetch = fetchMock;
  jest.clearAllMocks();
});

afterEach(() => {
  global.fetch = originalFetch;
});

it.each([true, false])("refreshes the extension only when the mutation succeeds (%s)", async ok => {
  const response = { ok };
  fetchMock.mockResolvedValueOnce(response);

  await expect(fetchTemplateMutation("/api/v1/templates", { method: "POST" })).resolves.toBe(response);
  expect(requestExtensionTemplateRefresh).toHaveBeenCalledTimes(ok ? 1 : 0);
});
