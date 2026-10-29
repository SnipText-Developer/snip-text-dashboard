import createTemplate from "./createTemplate";

const fetchMock = jest.fn();
const originalFetch = global.fetch;
const input = { title: "  견적  ", shortcut: "/견적", content: "첫줄\r\n다음줄\r끝" };
const template = { templateId: 12, title: "견적", shortcut: "/견적", deletedAt: "date", purgeAt: "date" };
function respond(status: number, data: unknown) {
  fetchMock.mockResolvedValue({ status, ok: status < 400, statusText: "Error", json: async () => data });
}

beforeEach(() => { global.fetch = fetchMock; fetchMock.mockReset(); });
afterAll(() => { global.fetch = originalFetch; });

const item = { name: "create", run: () => createTemplate("token", input), method: "POST", url: "/api/v1/templates", status: 201, code: "TEMPLATE201_1", result: template, error: "TEMPLATE409_1", errorStatus: 409 };

describe(item.name + " API", () => {
  test("sends authenticated request and returns success", async () => {
    const body = { isSuccess: true, code: item.code, message: "성공", result: item.result };
    respond(item.status, body);
    expect(await item.run()).toEqual(body);
    expect(fetchMock).toHaveBeenCalledWith(item.url, expect.objectContaining({ method: item.method, cache: "no-store", headers: { Authorization: "Bearer token", "Content-Type": "application/json" } }));
    const options = fetchMock.mock.calls[0][1];
    expect(JSON.parse(options.body)).toEqual({ title: "견적", shortcut: "/견적", content: "첫줄\n다음줄\n끝" });
  });

  test("returns documented error without throwing", async () => {
    const body = { isSuccess: false, code: item.error, message: "실패", result: null };
    respond(item.errorStatus, body);
    expect(await item.run()).toEqual(body);
  });

  test("preserves common errors", async () => {
    respond(401, { isSuccess: false, code: "AUTH401", message: "로그인 필요", result: null });
    await expect(item.run()).rejects.toMatchObject({ status: 401, code: "AUTH401", message: "로그인 필요" });
  });

  test("rejects non-JSON and network failures", async () => {
    fetchMock.mockResolvedValue({ status: 502, statusText: "Bad Gateway", json: async () => { throw new SyntaxError(); } });
    await expect(item.run()).rejects.toMatchObject({ status: 502 });
    fetchMock.mockRejectedValue(new TypeError("offline"));
    await expect(item.run()).rejects.toThrow("offline");
  });
});

const run = () => createTemplate("token", input);
test.each([1, 2, 3, 4, 5, 6, 7])("returns TEMPLATE400_%s", async (number) => {
    const body = { isSuccess: false, code: `TEMPLATE400_${number}`, message: "필드 오류", result: null };
    respond(400, body);
    expect(await run()).toEqual(body);
  });

test.each([
  { run: () => createTemplate("token", input), status: 403, code: "TEMPLATE403_1" },
])("returns documented $code ($status)", async ({ run, status, code }) => {
  const body = { isSuccess: false, code, message: "실패", result: null };
  respond(status, body);
  expect(await run()).toEqual(body);
});
