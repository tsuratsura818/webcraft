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

  const loadDemo = useCallback(() => {
    const demo: HearingSheet = {
      clientName: "株式会社さくらウェブ",
      clientIndustry: "Web制作・デジタルマーケティング",
      clientUrl: "https://sakura-web.co.jp",
      contactPerson: "佐藤花子",
      contactEmail: "sato@sakura-web.co.jp",
      contactPhone: "03-9876-5432",
      currentSituation: "5年前に制作したサイトが古くなり、スマートフォン対応ができていない。問い合わせが減少傾向で、競合他社に遅れをとっている。",
      competitors: "https://competitor-a.co.jp（モダンなデザインで参考にしたい）, https://competitor-b.co.jp（SEOが強い）",
      existingMaterials: "ロゴデータ（AI/PNG）、会社パンフレット（PDF）、過去の制作実績写真",
      accessAnalysis: "月間PV: 8,000 / UU: 3,200 / 直帰率: 65% / 平均滞在時間: 1分30秒",
      strengths: "創業15年の実績、幅広い業界対応力、ワンストップ対応（企画〜運用）",
      weaknesses: "Webサイトが古い、SNS活用が不十分、採用が難しい",
      opportunities: "DX需要の増加、中小企業のWeb化推進、補助金活用の機会",
      threats: "格安Web制作会社の台頭、AI活用ツールの普及、大手の中小市場参入",
      targetUsers: "中小企業（従業員10〜100名）の経営者・マーケティング担当者",
      personaAge: "35〜50代",
      personaGender: "男女問わず",
      personaOccupation: "中小企業経営者・Web担当者",
      personaNeeds: "売上アップにつながるWebサイトが欲しい、自社で更新できるようにしたい、SEO対策もしっかりしたい",
      customerJourney: "Google検索「Web制作 東京」→ サイト訪問 → 実績ページ閲覧 → 料金確認 → 資料請求/問い合わせ → 商談 → 受注",
      brandMessage: "ビジネスを加速させるWebパートナー - 戦略から運用まで伴走します",
      kgi: "年間売上30%アップ（現在8,000万→1億400万）",
      kpi: "月間問い合わせ数: 20件→40件、サイトPV: 8,000→20,000、CVR: 1%→3%",
      monetization: "Web制作受注（単価100〜500万円）、保守運用契約（月額3〜10万円）",
      projectGoal: "コーポレートサイトの全面リニューアルによる信頼性向上と問い合わせ数倍増",
      siteType: "コーポレートサイト",
      requiredPages: "トップページ、会社概要（代表挨拶・沿革・アクセス）、サービス紹介（Web制作・マーケティング・運用保守）、制作実績（カテゴリ別フィルタ付き）、料金プラン、ブログ/お知らせ、採用情報、お問い合わせ、プライバシーポリシー",
      features: ["お問い合わせフォーム", "ブログ / お知らせ", "FAQ / よくある質問", "資料ダウンロード", "SNSフィード表示", "管理画面（CMS）"],
      cmsType: "WordPress",
      designPreference: "モダン・クリーンで信頼感のあるデザイン。ブルー系をベースカラーに、アクセントにオレンジ。余白を活かした読みやすいレイアウト。",
      referenceUrls: "https://reference-modern.co.jp（レイアウト参考）, https://reference-clean.co.jp（色使い参考）",
      responsiveRequired: true,
      seoRequired: true,
      analyticsRequired: true,
      snsIntegration: ["X (Twitter)", "Instagram", "Facebook"],
      budgetRange: "200〜500万円",
      desiredLaunch: "2026-07-01",
      priority: "品質重視",
      materialsProvided: ["ロゴデータ", "写真素材", "テキスト原稿", "パンフレット / チラシ"],
      writingBy: "一部は制作会社に依頼（サービス紹介・会社概要）、ブログは自社で更新",
      operationPlan: "社内のWeb担当者1名がCMSで更新運用、月1回の分析レポートは制作会社に依頼",
      maintenanceRequired: true,
      serverType: "レンタルサーバー",
      serverName: "エックスサーバー ビジネスプラン",
      serverLoginInfo: "",
      domainName: "sakura-web.co.jp",
      domainRegistrar: "お名前.com",
      domainExpiry: "2027-06-15",
      sslType: "無料SSL（Let's Encrypt）",
      mailServer: "エックスサーバー メール",
      dnsManagement: "お名前.com",
      createdAt: "2026-03-09",
      updatedAt: "2026-03-09",
      status: "completed",
      notes: "7月1日の創業記念日に合わせてリニューアル公開したい。既存サイトのURLはできるだけ維持してリダイレクト対応をお願いしたい。",
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
    setHearing(demo);
  }, []);

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
            <div className="mt-4 flex items-center justify-center gap-3">
              <a
                href="/hearing"
                className="inline-block rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
              >
                ヒアリングシートへ
              </a>
              <button
                onClick={loadDemo}
                className="rounded-lg border border-blue-300 bg-blue-50 px-5 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                デモデータで試す
              </button>
            </div>
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
