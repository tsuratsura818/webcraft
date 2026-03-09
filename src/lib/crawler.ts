import * as cheerio from "cheerio";
import type { SitemapPage } from "@/types/sitemap";

interface CrawlOptions {
  maxDepth: number;
  maxPages: number;
}

export async function crawlSite(
  startUrl: string,
  options: CrawlOptions
): Promise<SitemapPage[]> {
  const baseUrl = new URL(startUrl);
  const origin = baseUrl.origin;
  const visited = new Set<string>();
  const results: SitemapPage[] = [];
  const queue: { url: string; depth: number }[] = [
    { url: normalizeUrl(startUrl), depth: 0 },
  ];

  while (queue.length > 0 && results.length < options.maxPages) {
    const batch = queue.splice(0, 5);

    const promises = batch
      .filter((item) => !visited.has(item.url))
      .map(async (item) => {
        if (visited.has(item.url) || results.length >= options.maxPages) return;
        visited.add(item.url);

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);

          const res = await fetch(item.url, {
            signal: controller.signal,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (compatible; WebCraft-Crawler/1.0)",
            },
            redirect: "follow",
          });
          clearTimeout(timeout);

          const contentType = res.headers.get("content-type") || "";
          if (!contentType.includes("text/html")) {
            results.push({
              url: item.url,
              path: new URL(item.url).pathname,
              title: "",
              depth: item.depth,
              statusCode: res.status,
              contentType: contentType.split(";")[0].trim(),
              h1: "",
              metaDescription: "",
              internalLinks: 0,
              externalLinks: 0,
            });
            return;
          }

          const html = await res.text();
          const $ = cheerio.load(html);

          const title = $("title").first().text().trim();
          const h1 = $("h1").first().text().trim();
          const metaDescription =
            $('meta[name="description"]').attr("content")?.trim() || "";

          let internalLinks = 0;
          let externalLinks = 0;
          const newUrls: string[] = [];

          $("a[href]").each((_, el) => {
            const href = $(el).attr("href");
            if (!href) return;

            try {
              const resolved = new URL(href, item.url);
              // フラグメントやクエリを除外
              resolved.hash = "";

              if (resolved.origin === origin) {
                internalLinks++;
                const normalized = normalizeUrl(resolved.href);
                if (
                  !visited.has(normalized) &&
                  item.depth + 1 <= options.maxDepth &&
                  isValidPath(resolved.pathname)
                ) {
                  newUrls.push(normalized);
                }
              } else {
                externalLinks++;
              }
            } catch {
              // 無効なURL
            }
          });

          results.push({
            url: item.url,
            path: new URL(item.url).pathname,
            title,
            depth: item.depth,
            statusCode: res.status,
            contentType: "text/html",
            h1,
            metaDescription,
            internalLinks,
            externalLinks,
          });

          for (const newUrl of newUrls) {
            if (!visited.has(newUrl)) {
              queue.push({ url: newUrl, depth: item.depth + 1 });
            }
          }
        } catch {
          results.push({
            url: item.url,
            path: new URL(item.url).pathname,
            title: "",
            depth: item.depth,
            statusCode: 0,
            contentType: "",
            h1: "",
            metaDescription: "",
            internalLinks: 0,
            externalLinks: 0,
          });
        }
      });

    await Promise.all(promises);
  }

  return results.sort((a, b) => a.path.localeCompare(b.path));
}

function normalizeUrl(url: string): string {
  const u = new URL(url);
  u.hash = "";
  // 末尾スラッシュ統一（ルート以外）
  if (u.pathname !== "/" && u.pathname.endsWith("/")) {
    u.pathname = u.pathname.slice(0, -1);
  }
  return u.href;
}

function isValidPath(pathname: string): boolean {
  const skipExtensions = [
    ".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp",
    ".pdf", ".zip", ".css", ".js", ".xml", ".json",
    ".ico", ".woff", ".woff2", ".ttf", ".eot",
    ".mp3", ".mp4", ".avi", ".mov",
  ];
  const lower = pathname.toLowerCase();
  return !skipExtensions.some((ext) => lower.endsWith(ext));
}
