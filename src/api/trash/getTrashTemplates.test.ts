import getTrashTemplates from "./getTrashTemplates";

const fetchMock = jest.fn();
const originalFetch = global.fetch;
function respond(status: number, data: unknown) {
  fetchMock.mockResolvedValue({ status, ok: status < 400, statusText: "Error", json: async () => data });
}

beforeEach(() => { global.fetch = fetchMock; fetchMock.mockReset(); });
afterAll(() => { global.fetch = originalFetch; });

const item = { name: "trash list", run: () => getTrashTemplates("token"), method: "GET", url: "/api/v1/trash/templates", status: 200, code: "TRASH200_1", result: { totalCount: 0, templates: [], hasNext: false, nextCursor: null }, error: "TRASH400_1", errorStatus: 400 };

describe(item.name + " API", () => {
  test("sends authenticated request and returns success", async () => {
    const body = { isSuccess: true, code: item.code, message: "성공", result: item.result };
    respond(item.status, body);
    expect(await item.run()).toEqual(body);
    expect(fetchMock).toHaveBeenCalledWith(item.url, expect.objectContaining({ method: item.method, cache: "no-store", headers: { Authorization: "Bearer token", "Content-Type": "application/json" } }));
    const options = fetchMock.mock.calls[0][1];
    expect(options.body).toBeUndefined();
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

test("cursor is encoded without alteration and signal is forwarded", async () => {
  respond(400, { isSuccess: false, code: "TRASH400_1", message: "페이지 오류", result: null });
  const signal = new AbortController().signal;
  await getTrashTemplates("token", { cursor: "a+b/한글=", size: 50 }, signal);
  const [url, options] = fetchMock.mock.calls[0];
  const query = new URL(url, "https://example.com").searchParams;
  expect(query.get("cursor")).toBe("a+b/한글=");
  expect(query.get("size")).toBe("50");
  expect(options.signal).toBe(signal);
});
