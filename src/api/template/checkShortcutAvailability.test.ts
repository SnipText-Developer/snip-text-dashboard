import checkShortcutAvailability from "./checkShortcutAvailability";

const fetchMock = jest.fn();
const originalFetch = global.fetch;
function respond(status: number, data: unknown) {
  fetchMock.mockResolvedValue({ status, ok: status < 400, statusText: "Error", json: async () => data });
}

beforeEach(() => { global.fetch = fetchMock; fetchMock.mockReset(); });
afterAll(() => { global.fetch = originalFetch; });

test.each([null, "INVALID_FORMAT", "RESERVED", "DUPLICATED"])("availability returns reason %s as success and encodes query", async (reason) => {
  const body = { isSuccess: true, code: "TEMPLATE200_5", message: "성공", result: { shortcut: "/견적", available: reason === null, reason } };
  respond(200, body);
  expect(await checkShortcutAvailability("token", { shortcut: "/견적", excludeTemplateId: 12 })).toEqual(body);
  const url = new URL(fetchMock.mock.calls[0][0], "https://example.com");
  expect(url.searchParams.get("shortcut")).toBe("/견적");
  expect(url.searchParams.get("excludeTemplateId")).toBe("12");
  expect(url.search).toContain("%2F");
});

test("availability omits excludeTemplateId when not supplied", async () => {
  respond(200, { isSuccess: true, code: "TEMPLATE200_5", message: "성공", result: { shortcut: "/견적", available: true, reason: null } });
  await checkShortcutAvailability("token", { shortcut: "/견적" });
  expect(fetchMock.mock.calls[0][0]).not.toContain("excludeTemplateId");
});

test("rejects unknown availability reasons", async () => {
  respond(200, { isSuccess: true, code: "TEMPLATE200_5", message: "성공", result: { shortcut: "/견적", available: false, reason: "UNKNOWN" } });
  await expect(checkShortcutAvailability("token", { shortcut: "/견적" })).rejects.toMatchObject({ status: 200 });
});
