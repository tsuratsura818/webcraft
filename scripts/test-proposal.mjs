// 提案書API 実動作テスト（全5セクション）
import { writeFileSync } from "fs";

const BASE_URL = "http://localhost:3000/api/proposal";

const hearingData = {
  clientName: "株式会社さくらウェブ",
  clientIndustry: "Web制作・デジタルマーケティング",
  clientUrl: "https://sakura-web.co.jp",
  contactPerson: "佐藤花子",
  contactEmail: "sato@sakura-web.co.jp",
  contactPhone: "03-9876-5432",
  currentSituation:
    "5年前に制作したサイトが古くなり、スマートフォン対応ができていない。問い合わせが減少傾向で、競合他社に遅れをとっている。",
  competitors:
    "https://competitor-a.co.jp（モダンなデザインで参考にしたい）, https://competitor-b.co.jp（SEOが強い）",
  existingMaterials:
    "ロゴデータ（AI/PNG）、会社パンフレット（PDF）、過去の制作実績写真",
  accessAnalysis:
    "月間PV: 8,000 / UU: 3,200 / 直帰率: 65% / 平均滞在時間: 1分30秒",
  strengths:
    "創業15年の実績、幅広い業界対応力、ワンストップ対応（企画〜運用）",
  weaknesses: "Webサイトが古い、SNS活用が不十分、採用が難しい",
  opportunities:
    "DX需要の増加、中小企業のWeb化推進、補助金活用の機会",
  threats:
    "格安Web制作会社の台頭、AI活用ツールの普及、大手の中小市場参入",
  targetUsers: "中小企業（従業員10〜100名）の経営者・マーケティング担当者",
  personaAge: "35〜50代",
  personaGender: "男女問わず",
  personaOccupation: "中小企業経営者・Web担当者",
  personaNeeds:
    "売上アップにつながるWebサイトが欲しい、自社で更新できるようにしたい、SEO対策もしっかりしたい",
  customerJourney:
    "Google検索「Web制作 東京」→ サイト訪問 → 実績ページ閲覧 → 料金確認 → 資料請求/問い合わせ → 商談 → 受注",
  brandMessage:
    "ビジネスを加速させるWebパートナー - 戦略から運用まで伴走します",
  kgi: "年間売上30%アップ（現在8,000万→1億400万）",
  kpi: "月間問い合わせ数: 20件→40件、サイトPV: 8,000→20,000、CVR: 1%→3%",
  monetization:
    "Web制作受注（単価100〜500万円）、保守運用契約（月額3〜10万円）",
  projectGoal:
    "コーポレートサイトの全面リニューアルによる信頼性向上と問い合わせ数倍増",
  siteType: "コーポレートサイト",
  requiredPages:
    "トップページ、会社概要（代表挨拶・沿革・アクセス）、サービス紹介（Web制作・マーケティング・運用保守）、制作実績（カテゴリ別フィルタ付き）、料金プラン、ブログ/お知らせ、採用情報、お問い合わせ、プライバシーポリシー",
  features: [
    "お問い合わせフォーム",
    "ブログ / お知らせ",
    "FAQ / よくある質問",
    "資料ダウンロード",
    "SNSフィード表示",
    "管理画面（CMS）",
  ],
  cmsType: "WordPress",
  designPreference:
    "モダン・クリーンで信頼感のあるデザイン。ブルー系をベースカラーに、アクセントにオレンジ。余白を活かした読みやすいレイアウト。",
  referenceUrls:
    "https://reference-modern.co.jp（レイアウト参考）, https://reference-clean.co.jp（色使い参考）",
  responsiveRequired: true,
  seoRequired: true,
  analyticsRequired: true,
  snsIntegration: ["X (Twitter)", "Instagram", "Facebook"],
  budgetRange: "200〜500万円",
  desiredLaunch: "2026-07-01",
  priority: "品質重視",
  materialsProvided: [
    "ロゴデータ",
    "写真素材",
    "テキスト原稿",
    "パンフレット / チラシ",
  ],
  writingBy:
    "一部は制作会社に依頼（サービス紹介・会社概要）、ブログは自社で更新",
  operationPlan:
    "社内のWeb担当者1名がCMSで更新運用、月1回の分析レポートは制作会社に依頼",
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
  notes:
    "7月1日の創業記念日に合わせてリニューアル公開したい。既存サイトのURLはできるだけ維持してリダイレクト対応をお願いしたい。",
};

const sections = [
  { key: "sitemap", label: "ディレクトリマップ" },
  { key: "wireframes", label: "ワイヤーフレーム" },
  { key: "topDesign", label: "TOPページデザイン案" },
  { key: "schedule", label: "スケジュール案" },
  { key: "clientTasks", label: "クライアントタスク" },
];

async function testSection(section, label, index) {
  console.log(`\n==========================================`);
  console.log(`[${index + 1}/5] ${label} (${section}) を生成中...`);
  console.log(`==========================================`);

  const start = Date.now();

  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, hearingData }),
    });

    const data = await res.json();
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    if (data.error) {
      console.log(`  ❌ エラー: ${data.error}`);
      return { section, label, success: false, error: data.error };
    }

    const html = data.html || "";
    const lines = html.split("\n").length;
    const chars = html.length;

    // HTMLファイルとして保存
    const outFile = `scripts/test-output-${section}.html`;
    writeFileSync(outFile, html, "utf-8");

    console.log(`  ✅ 生成完了 (${elapsed}秒)`);
    console.log(`     ${lines}行 / ${chars.toLocaleString()}文字 → ${outFile}`);

    // HTMLの先頭50文字を確認
    const preview = html.slice(0, 80).replace(/\n/g, " ");
    console.log(`     プレビュー: ${preview}...`);

    return { section, label, success: true, lines, chars, elapsed };
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`  ❌ 通信エラー (${elapsed}秒): ${err.message}`);
    return { section, label, success: false, error: err.message };
  }
}

async function main() {
  console.log("=== WebCraft 提案書API 実動作テスト ===");
  console.log(`クライアント: ${hearingData.clientName}`);
  console.log(`サイト種別: ${hearingData.siteType}`);
  console.log(`予算: ${hearingData.budgetRange}`);
  console.log(`公開目標: ${hearingData.desiredLaunch}`);

  const results = [];

  for (let i = 0; i < sections.length; i++) {
    const r = await testSection(sections[i].key, sections[i].label, i);
    results.push(r);
  }

  console.log("\n==========================================");
  console.log("テスト結果サマリー");
  console.log("==========================================");

  let allPass = true;
  for (const r of results) {
    const icon = r.success ? "✅" : "❌";
    const detail = r.success
      ? `${r.lines}行 / ${r.chars.toLocaleString()}文字 (${r.elapsed}秒)`
      : r.error;
    console.log(`  ${icon} ${r.label}: ${detail}`);
    if (!r.success) allPass = false;
  }

  console.log(`\n${allPass ? "✅ 全セクション正常生成！" : "⚠️ 一部エラーあり"}`);
}

main().catch(console.error);
