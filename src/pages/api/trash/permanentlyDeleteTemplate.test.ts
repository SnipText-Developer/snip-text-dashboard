import permanentlyDeleteTemplate from "./permanentlyDeleteTemplate";

const fetchMock = jest.fn();
const originalFetch = global.fetch;
function respond(status: number, data: unknown) {
  fetchMock.mockResolvedValue({ status, ok: status < 400, statusText: "Error", json: async () => data });
}

beforeEach(() => { global.fetch = fetchMock; fetchMock.mockReset(); });
afterAll(() => { global.fetch = originalFetch; });

const item = { name: "permanent delete", run: () => permanentlyDeleteTemplate("token", 12), method: "DELETE", url: "/api/v1/trash/templates/12", status: 200, code: "TRASH200_3", result: { templateId: 12 }, error: "TRASH404_1", errorStatus: 404 };

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
