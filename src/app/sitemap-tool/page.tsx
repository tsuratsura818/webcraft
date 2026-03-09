"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import type { CrawlResult, SitemapPage } from "@/types/sitemap";

export default function SitemapToolPage() {
  const [url, setUrl] = useState("");
  const [maxDepth, setMaxDepth] = useState(3);
  const [maxPages, setMaxPages] = useState(100);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [error, setError] = useState("");

  async function handleCrawl() {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), maxDepth, maxPages }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "エラーが発生しました");
      } else {
        setResult(data as CrawlResult);
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    if (!result) return;
    const headers = [
      "URL",
      "パス",
      "階層",
      "ステータス",
      "タイトル",
      "H1",
      "meta description",
      "内部リンク数",
      "外部リンク数",
      "Content-Type",
    ];
    const rows = result.pages.map((p) => [
      p.url,
      p.path,
      String(p.depth),
      String(p.statusCode),
      escCsv(p.title),
      escCsv(p.h1),
      escCsv(p.metaDescription),
      String(p.internalLinks),
      String(p.externalLinks),
      p.contentType,
    ]);

    const bom = "\uFEFF";
    const csv =
      bom +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const domain = new URL(result.baseUrl).hostname;
    link.download = `sitemap_${domain}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function exportTsv() {
    if (!result) return;
    const headers = [
      "URL",
      "パス",
      "階層",
      "ステータス",
      "タイトル",
      "H1",
      "meta description",
      "内部リンク数",
      "外部リンク数",
    ];
    const rows = result.pages.map((p) => [
      p.url,
      p.path,
      String(p.depth),
      String(p.statusCode),
      p.title.replace(/\t/g, " "),
      p.h1.replace(/\t/g, " "),
      p.metaDescription.replace(/\t/g, " "),
      String(p.internalLinks),
      String(p.externalLinks),
    ]);

    const bom = "\uFEFF";
    const tsv =
      bom +
      [headers.join("\t"), ...rows.map((r) => r.join("\t"))].join("\n");

    const blob = new Blob([tsv], { type: "text/tab-separated-values;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const domain = new URL(result.baseUrl).hostname;
    link.download = `sitemap_${domain}_${new Date().toISOString().slice(0, 10)}.tsv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          ディレクトリマップ
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          競合サイトのページ構成を自動解析してCSV/スプレッドシート出力
        </p>

        {/* 入力フォーム */}
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                対象サイトURL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) handleCrawl();
                }}
              />
            </div>
            <div className="w-28">
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                最大階層
              </label>
              <select
                value={maxDepth}
                onChange={(e) => setMaxDepth(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {[1, 2, 3, 4, 5].map((d) => (
                  <option key={d} value={d}>
                    {d}階層
                  </option>
                ))}
              </select>
            </div>
            <div className="w-28">
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                最大ページ
              </label>
              <select
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {[50, 100, 200, 300].map((n) => (
                  <option key={n} value={n}>
                    {n}件
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCrawl}
              disabled={loading || !url.trim()}
              className="rounded-lg bg-zinc-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? "解析中..." : "解析開始"}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-500">{error}</p>
          )}
        </div>

        {/* ローディング */}
        {loading && (
          <div className="mt-8 flex items-center justify-center gap-3 text-zinc-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
            <span className="text-sm">サイトをクロール中...</span>
          </div>
        )}

        {/* 結果 */}
        {result && (
          <>
            {/* サマリー + エクスポート */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-6 text-sm text-zinc-600 dark:text-zinc-400">
                <span>
                  検出ページ:{" "}
                  <strong className="text-zinc-900 dark:text-zinc-50">
                    {result.totalPages}件
                  </strong>
                </span>
                <span>
                  解析時間:{" "}
                  <strong className="text-zinc-900 dark:text-zinc-50">
                    {(result.elapsedMs / 1000).toFixed(1)}秒
                  </strong>
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportCsv}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  CSV出力
                </button>
                <button
                  onClick={exportTsv}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  TSV出力（スプレッドシート用）
                </button>
              </div>
            </div>

            {/* テーブル */}
            <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                    <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                      #
                    </th>
                    <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                      パス
                    </th>
                    <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                      タイトル
                    </th>
                    <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                      階層
                    </th>
                    <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                      Status
                    </th>
                    <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                      内部
                    </th>
                    <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                      外部
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.pages.map((page, i) => (
                    <PageRow key={page.url} page={page} index={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

function PageRow({ page, index }: { page: SitemapPage; index: number }) {
  const statusColor =
    page.statusCode >= 200 && page.statusCode < 300
      ? "text-green-600"
      : page.statusCode >= 300 && page.statusCode < 400
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <tr className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50">
      <td className="px-4 py-3 text-zinc-400">{index + 1}</td>
      <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-300">
        <a
          href={page.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {page.path}
        </a>
      </td>
      <td className="max-w-sm truncate px-4 py-3 text-zinc-900 dark:text-zinc-100">
        {page.title || "-"}
      </td>
      <td className="px-4 py-3 text-zinc-500">{page.depth}</td>
      <td className={`px-4 py-3 font-medium ${statusColor}`}>
        {page.statusCode || "ERR"}
      </td>
      <td className="px-4 py-3 text-zinc-500">{page.internalLinks}</td>
      <td className="px-4 py-3 text-zinc-500">{page.externalLinks}</td>
    </tr>
  );
}

function escCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
