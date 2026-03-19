import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import officeparser from "officeparser";
import {
  FEATURE_OPTIONS,
  SNS_OPTIONS,
  MATERIAL_OPTIONS,
} from "@/types/hearing";

export const maxDuration = 60;

const client = new Anthropic();

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.ms-powerpoint",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "ファイルが選択されていません" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "ファイルサイズは10MB以下にしてください" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "対応形式: PDF / Word (.docx) / PowerPoint (.pptx)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await officeparser.parseOffice(buffer);
    const text = String(rawText ?? "");

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { error: "ファイルからテキストを抽出できませんでした。別の形式で試してください" },
        { status: 400 }
      );
    }

    // テキストが長すぎる場合は先頭を使用
    const truncated = text.slice(0, 15000);

    const featuresList = FEATURE_OPTIONS.join(" / ");
    const snsList = SNS_OPTIONS.join(" / ");
    const materialsList = MATERIAL_OPTIONS.join(" / ");

    const prompt = `以下は企画書・事業計画書のテキストです。この内容を分析して、WEBサイト制作のヒアリングシートを自動生成してください。

【企画書テキスト】
${truncated}

【出力形式】
以下のJSON形式で出力してください。企画書に情報がないフィールドは空文字""、配列は[]にしてください。
推測可能な項目はAIとして最適な提案を記入してください。

{
  "clientName": "会社名・団体名",
  "clientIndustry": "業種",
  "clientUrl": "現在のサイトURL",
  "contactPerson": "担当者名",
  "contactEmail": "",
  "contactPhone": "",
  "currentSituation": "現状の課題・背景（企画書の内容から要約）",
  "competitors": "競合サイト（企画書に記載があれば）",
  "existingMaterials": "既存資料の有無",
  "accessAnalysis": "",
  "strengths": "強み（SWOT分析）",
  "weaknesses": "弱み",
  "opportunities": "機会",
  "threats": "脅威",
  "targetUsers": "ターゲットユーザー",
  "personaAge": "年齢層",
  "personaGender": "性別",
  "personaOccupation": "職業",
  "personaNeeds": "ニーズ・課題",
  "customerJourney": "カスタマージャーニー（認知→検討→行動）",
  "brandMessage": "ブランドメッセージ・トンマナ",
  "kgi": "KGI（最終目標）",
  "kpi": "KPI（中間指標）",
  "monetization": "収益化方針",
  "projectGoal": "プロジェクトの目的・ゴール",
  "siteType": "コーポレートサイト / ECサイト / LP / メディア等",
  "requiredPages": "必要なページ一覧",
  "features": [以下から該当するものを選択: ${featuresList}],
  "cmsType": "WordPress / Shopify / Next.js等",
  "designPreference": "デザインの方向性",
  "referenceUrls": "参考サイトURL",
  "responsiveRequired": true/false,
  "seoRequired": true/false,
  "analyticsRequired": true/false,
  "snsIntegration": [以下から該当するものを選択: ${snsList}],
  "budgetRange": "予算感",
  "desiredLaunch": "希望公開日（YYYY-MM-DD形式）",
  "priority": "品質重視 / スピード重視 / コスト重視",
  "materialsProvided": [以下から該当するものを選択: ${materialsList}],
  "writingBy": "ライティング担当",
  "operationPlan": "公開後の運用体制",
  "maintenanceRequired": true/false,
  "serverType": "",
  "serverName": "",
  "domainName": "",
  "sslType": "",
  "notes": "その他特記事項"
}

JSONのみを返してください。説明や\`\`\`は不要です。`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AIの応答からデータを抽出できませんでした" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // メタフィールドを追加
    const today = new Date().toISOString().slice(0, 10);
    parsed.createdAt = today;
    parsed.updatedAt = today;
    parsed.status = "draft";
    parsed.serverLoginInfo = parsed.serverLoginInfo || "";
    parsed.domainRegistrar = parsed.domainRegistrar || "";
    parsed.domainExpiry = parsed.domainExpiry || "";
    parsed.mailServer = parsed.mailServer || "";
    parsed.dnsManagement = parsed.dnsManagement || "";

    // 配列フィールドの型安全確保
    if (!Array.isArray(parsed.features)) parsed.features = [];
    if (!Array.isArray(parsed.snsIntegration)) parsed.snsIntegration = [];
    if (!Array.isArray(parsed.materialsProvided)) parsed.materialsProvided = [];

    // booleanフィールドの型安全確保
    parsed.responsiveRequired = parsed.responsiveRequired !== false;
    parsed.seoRequired = parsed.seoRequired !== false;
    parsed.analyticsRequired = parsed.analyticsRequired !== false;
    parsed.maintenanceRequired = parsed.maintenanceRequired === true;

    return NextResponse.json({ hearingData: parsed, extractedTextLength: text.length });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "ファイル解析中にエラーが発生しました";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
