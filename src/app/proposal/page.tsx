"use client";

import { useState, useCallback, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import type { HearingSheet } from "@/types/hearing";
import type { ProposalData, ProposalSection } from "@/types/proposal";
import { PROPOSAL_SECTIONS } from "@/types/proposal";

const STORAGE_KEY = "webcraft_hearing_for_proposal";

export default function ProposalPage() {
  const [hearing, setHearing] = useState<HearingSheet | null>(null);
  const [proposal, setProposal] = useState<ProposalData>({
    sitemap: "",
    wireframes: "",
    topDesign: "",
    schedule: "",
    clientTasks: "",
  });
  const [activeSection, setActiveSection] = useState<ProposalSection>("sitemap");
  const [loading, setLoading] = useState<ProposalSection | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      setHearing(JSON.parse(stored));
    }
  }, []);

  const generate = useCallback(
    async (section: ProposalSection) => {
      if (!hearing) return;
      setLoading(section);
      setError("");
      setActiveSection(section);

      try {
        const res = await fetch("/api/proposal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section, hearingData: hearing }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "生成に失敗しました");
          return;
        }
        setProposal((prev) => ({ ...prev, [section]: data.html }));
      } catch {
        setError("通信エラーが発生しました");
      } finally {
        setLoading(null);
      }
    },
    [hearing]
  );

  const generateAll = useCallback(async () => {
    for (const s of PROPOSAL_SECTIONS) {
      await generate(s.key);
    }
  }, [generate]);

  const exportSection = useCallback(
    (section: ProposalSection) => {
      const html = proposal[section];
      if (!html) return;
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const label = PROPOSAL_SECTIONS.find((s) => s.key === section)?.label || section;
      link.download = `${label}_${hearing?.clientName || "proposal"}_${new Date().toISOString().slice(0, 10)}.html`;
      link.click();
      URL.revokeObjectURL(link.href);
    },
    [proposal, hearing]
  );

  const printSection = useCallback(
    (section: ProposalSection) => {
      const html = proposal[section];
      if (!html) return;
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 500);
      }
    },
    [proposal]
  );

  if (!hearing) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center p-8">
          <div className="text-center">
            <p className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
              ヒアリングデータがありません
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              先にヒアリングシートを入力してから「提案書を生成」してください
            </p>
            <a
              href="/hearing"
              className="mt-4 inline-block rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
            >
              ヒアリングシートへ
            </a>
          </div>
        </div>
      </AppLayout>
    );
  }

  const currentHtml = proposal[activeSection];

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              提案書生成
            </h1>
            <p className="text-sm text-zinc-500">
              {hearing.clientName || "クライアント未設定"} - ヒアリング内容からAIが提案書を生成
            </p>
          </div>
          <button
            onClick={generateAll}
            disabled={loading !== null}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "生成中..." : "全セクション一括生成"}
          </button>
        </div>

        {/* セクションタブ */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          {PROPOSAL_SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
                activeSection === s.key
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <span>{s.icon}</span>
              {s.label}
              {proposal[s.key] && (
                <span className="ml-1 inline-block h-2 w-2 rounded-full bg-green-500" />
              )}
            </button>
          ))}
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto">
          {/* アクションバー */}
          <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-6 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
            <button
              onClick={() => generate(activeSection)}
              disabled={loading !== null}
              className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {loading === activeSection ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                  生成中...
                </>
              ) : (
                <>
                  <span>✨</span>
                  {currentHtml ? "再生成" : "生成する"}
                </>
              )}
            </button>
            {currentHtml && (
              <div className="flex gap-2">
                <button
                  onClick={() => exportSection(activeSection)}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                >
                  HTML保存
                </button>
                <button
                  onClick={() => printSection(activeSection)}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                >
                  PDF印刷
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mx-6 mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* プレビュー */}
          {currentHtml ? (
            <div className="p-6">
              <iframe
                srcDoc={currentHtml}
                className="w-full rounded-xl border border-zinc-200 bg-white dark:border-zinc-700"
                style={{ minHeight: "80vh" }}
                sandbox="allow-scripts"
                title={PROPOSAL_SECTIONS.find((s) => s.key === activeSection)?.label}
              />
            </div>
          ) : (
            <div className="flex h-96 items-center justify-center text-sm text-zinc-400">
              「生成する」ボタンを押してAIに提案書を作成させてください
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
