import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSampleHearing } from "./helpers";

// Anthropic SDK モック
const mockCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class MockAnthropic {
      messages = { create: mockCreate };
    },
  };
});

// next/server モック
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    }),
  },
}));

describe("POST /api/proposal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function callApi(section: string, hearingData = createSampleHearing()) {
    const { POST } = await import("@/app/api/proposal/route");
    const req = {
      json: async () => ({ section, hearingData }),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return POST(req as any);
  }

  it("sitemapセクションで正常にHTMLを返す", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "<html><body>サイトマップ</body></html>" }],
    });

    const res = await callApi("sitemap");
    expect(res.status).toBe(200);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((res as any).body.html).toContain("サイトマップ");
  });

  it("wireframesセクションで正常にHTMLを返す", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "<html><body>ワイヤーフレーム</body></html>" }],
    });

    const res = await callApi("wireframes");
    expect(res.status).toBe(200);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((res as any).body.html).toContain("ワイヤーフレーム");
  });

  it("topDesignセクションで正常にHTMLを返す", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "<html><body>TOPデザイン</body></html>" }],
    });

    const res = await callApi("topDesign");
    expect(res.status).toBe(200);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((res as any).body.html).toContain("TOPデザイン");
  });

  it("scheduleセクションで正常にHTMLを返す", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "<html><body>スケジュール</body></html>" }],
    });

    const res = await callApi("schedule");
    expect(res.status).toBe(200);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((res as any).body.html).toContain("スケジュール");
  });

  it("clientTasksセクションで正常にHTMLを返す", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "<html><body>クライアントタスク</body></html>" }],
    });

    const res = await callApi("clientTasks");
    expect(res.status).toBe(200);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((res as any).body.html).toContain("クライアントタスク");
  });

  it("無効なセクション名で400エラーを返す", async () => {
    const res = await callApi("invalidSection");
    expect(res.status).toBe(400);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((res as any).body.error).toBe("無効なセクションです");
  });

  it("Claude APIエラー時に500を返す", async () => {
    mockCreate.mockRejectedValueOnce(new Error("API rate limit exceeded"));

    const res = await callApi("sitemap");
    expect(res.status).toBe(500);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((res as any).body.error).toBe("API rate limit exceeded");
  });

  it("不明なエラー時にデフォルトメッセージを返す", async () => {
    mockCreate.mockRejectedValueOnce("unknown error");

    const res = await callApi("sitemap");
    expect(res.status).toBe(500);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((res as any).body.error).toBe("提案書生成中にエラーが発生しました");
  });

  it("Claude APIに正しいモデルとmax_tokensが渡される", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "<html></html>" }],
    });

    await callApi("sitemap");

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
      })
    );
  });

  it("ヒアリングデータがプロンプトに含まれる", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "<html></html>" }],
    });

    const hearing = createSampleHearing({ clientName: "テスト企業ABC" });
    await callApi("sitemap", hearing);

    const call = mockCreate.mock.calls[0][0];
    const prompt = call.messages[0].content;
    expect(prompt).toContain("テスト企業ABC");
    expect(prompt).toContain("IT・Web");
    expect(prompt).toContain("コーポレートサイト");
  });

  it("features配列がカンマ区切りでプロンプトに含まれる", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "<html></html>" }],
    });

    await callApi("sitemap");

    const call = mockCreate.mock.calls[0][0];
    const prompt = call.messages[0].content;
    expect(prompt).toContain("お問い合わせフォーム、ブログ / お知らせ、FAQ / よくある質問");
  });

  it("content[0].typeがtext以外の場合は空文字を返す", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "tool_use", id: "t1", name: "test", input: {} }],
    });

    const res = await callApi("sitemap");
    expect(res.status).toBe(200);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((res as any).body.html).toBe("");
  });
});
