import { NextRequest, NextResponse } from "next/server";
import { crawlSite } from "@/lib/crawler";
import type { CrawlRequest, CrawlResult } from "@/types/sitemap";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CrawlRequest;

    if (!body.url) {
      return NextResponse.json(
        { error: "URLを入力してください" },
        { status: 400 }
      );
    }

    // URL形式を検証
    let targetUrl: URL;
    try {
      targetUrl = new URL(
        body.url.startsWith("http") ? body.url : `https://${body.url}`
      );
    } catch {
      return NextResponse.json(
        { error: "無効なURLです" },
        { status: 400 }
      );
    }

    const maxDepth = Math.min(body.maxDepth || 3, 5);
    const maxPages = Math.min(body.maxPages || 100, 300);

    const startTime = Date.now();
    const pages = await crawlSite(targetUrl.href, { maxDepth, maxPages });
    const elapsedMs = Date.now() - startTime;

    const result: CrawlResult = {
      baseUrl: targetUrl.origin,
      pages,
      totalPages: pages.length,
      crawledAt: new Date().toISOString(),
      elapsedMs,
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "クロール中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
