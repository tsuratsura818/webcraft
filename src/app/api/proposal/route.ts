import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { HearingSheet } from "@/types/hearing";
import type { ProposalSection } from "@/types/proposal";

const client = new Anthropic();

function hearingContext(data: HearingSheet): string {
  return `【クライアント情報】
- 会社名: ${data.clientName || "未入力"}
- 業種: ${data.clientIndustry || "未入力"}
- 現在のサイト: ${data.clientUrl || "なし"}
- 担当者: ${data.contactPerson || "未入力"}

【現状・課題】
${data.currentSituation || "未入力"}

【競合サイト】
${data.competitors || "未入力"}

【SWOT】
- 強み: ${data.strengths || "未入力"}
- 弱み: ${data.weaknesses || "未入力"}
- 機会: ${data.opportunities || "未入力"}
- 脅威: ${data.threats || "未入力"}

【ターゲット】
${data.targetUsers || "未入力"}
- ペルソナ: ${data.personaAge} / ${data.personaGender} / ${data.personaOccupation}
- ニーズ: ${data.personaNeeds || "未入力"}

【ブランド・KPI】
- ブランドメッセージ: ${data.brandMessage || "未入力"}
- KGI: ${data.kgi || "未入力"}
- KPI: ${data.kpi || "未入力"}

【プロジェクト】
- 目的: ${data.projectGoal || "未入力"}
- サイト種別: ${data.siteType || "未入力"}
- 必要ページ: ${data.requiredPages || "未入力"}
- 必要機能: ${data.features.join("、") || "未入力"}
- CMS: ${data.cmsType || "未入力"}
- デザイン方向性: ${data.designPreference || "未入力"}
- 参考サイト: ${data.referenceUrls || "未入力"}
- テーマカラー/トンマナ: ${data.brandMessage || "未入力"}
- レスポンシブ: ${data.responsiveRequired ? "必要" : "不要"}
- SEO: ${data.seoRequired ? "必要" : "不要"}
- SNS連携: ${data.snsIntegration.join("、") || "なし"}

【予算・スケジュール】
- 予算: ${data.budgetRange || "未入力"}
- 希望公開日: ${data.desiredLaunch || "未入力"}
- 優先事項: ${data.priority || "未入力"}

【素材・運用】
- 提供素材: ${data.materialsProvided.join("、") || "未入力"}
- ライティング: ${data.writingBy || "未入力"}
- 運用体制: ${data.operationPlan || "未入力"}
- 保守契約: ${data.maintenanceRequired ? "希望あり" : "希望なし"}

【インフラ】
- サーバー: ${data.serverType || "未定"} / ${data.serverName || "未定"}
- ドメイン: ${data.domainName || "未定"}
- SSL: ${data.sslType || "未定"}`;
}

const PROMPTS: Record<ProposalSection, (ctx: string) => string> = {
  sitemap: (ctx) => `あなたはWEB制作会社のディレクターです。以下のヒアリング情報からサイトのディレクトリマップ（ページ構成）を提案してください。

${ctx}

以下の形式で出力してください（HTMLで、ツリー構造を視覚的に表現）:
- 各ページに「ページ名」「URL」「主なコンテンツ」「備考」を記載
- 階層構造をインデントで表現
- ページ数は必要に応じて適切に

完成されたHTMLのみを返してください。\`\`\`やコードブロックは不要です。スタイルは<style>タグで埋め込み。フォントは-apple-system, sans-serif。背景白。`,

  wireframes: (ctx) => `あなたはWEB制作会社のUIデザイナーです。以下のヒアリング情報から全ページのワイヤーフレームをHTMLで作成してください。

${ctx}

要件:
- 各ページごとにセクションを分けて、レイアウト構成を示す
- グレーの矩形とテキストでワイヤーフレームを表現
- 各要素に「ここにはXXが入る」等の注記を入れる
- ページ間の遷移（どのボタンがどのページに飛ぶか）を注記で示す
- アニメーション指示がある場合は「[Animation] フェードイン 0.3s」のように注記
- ヘッダー・フッターの共通要素も示す
- SP（モバイル）での変更点も注記する

完成されたHTMLのみを返してください。\`\`\`やコードブロックは不要です。スタイルは<style>タグで埋め込み。背景白。各ページは改ページ可能にする。`,

  topDesign: (ctx) => `あなたはWEB制作会社のデザイナーです。以下のヒアリング情報からTOPページのデザインモックアップをHTML/CSSで作成してください。

${ctx}

要件:
- 実際のデザインに近いモックアップ（ダミーテキスト・プレースホルダー画像使用可）
- ブランドカラー・トンマナを反映
- ヘッダー（ロゴ・ナビ）、ヒーロー、各セクション、フッターを含む
- レスポンシブデザイン
- CSSアニメーション（フェードイン等）を含む
- プレースホルダー画像はCSS背景色の矩形で代用（外部URL不使用）
- モダンでプロフェッショナルなデザイン

完成されたHTMLのみを返してください。\`\`\`やコードブロックは不要です。全スタイルは<style>タグに埋め込み。`,

  schedule: (ctx) => `あなたはWEB制作会社のプロジェクトマネージャーです。以下のヒアリング情報から制作スケジュール案をHTMLで作成してください。

${ctx}

要件:
- フェーズ: ヒアリング → 企画・戦略 → 設計 → デザイン → コーディング → テスト → 公開 → 運用開始
- 各フェーズに期間（週単位）と主な作業内容を記載
- ガントチャート風のビジュアル表示（CSSで横棒グラフ）
- マイルストーン（中間確認、デザインFIX等）を明示
- 希望公開日から逆算
- クライアント確認が必要なタイミングを明示

完成されたHTMLのみを返してください。\`\`\`やコードブロックは不要です。スタイルは<style>タグで埋め込み。`,

  clientTasks: (ctx) => `あなたはWEB制作会社のディレクターです。以下のヒアリング情報からクライアントに必要なタスクのチェックリストをHTMLで作成してください。

${ctx}

要件:
- フェーズごとに分けて（契約前 / 企画段階 / デザイン段階 / 構築段階 / 公開前 / 公開後）
- チェックボックス形式
- 各タスクに「いつまでに」「誰が」「何を」を明記
- 素材提供、原稿作成、確認・承認、アカウント情報提供等を含む
- サーバー・ドメイン関連のタスクも含む
- 優先度（必須/推奨）も表示

完成されたHTMLのみを返してください。\`\`\`やコードブロックは不要です。スタイルは<style>タグで埋め込み。印刷対応。`,
};

export async function POST(req: NextRequest) {
  try {
    const { section, hearingData } = (await req.json()) as {
      section: ProposalSection;
      hearingData: HearingSheet;
    };

    if (!PROMPTS[section]) {
      return NextResponse.json({ error: "無効なセクションです" }, { status: 400 });
    }

    const ctx = hearingContext(hearingData);
    const prompt = PROMPTS[section](ctx);

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ html: text });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "提案書生成中にエラーが発生しました";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
