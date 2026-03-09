import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

interface AnalysisRequest {
  type: "swot" | "journey" | "kpi" | "brand";
  context: {
    clientName: string;
    clientIndustry: string;
    clientUrl: string;
    currentSituation: string;
    competitors: string;
    targetUsers: string;
    projectGoal: string;
    siteType: string;
    // SWOT既存入力
    strengths?: string;
    weaknesses?: string;
    opportunities?: string;
    threats?: string;
  };
}

const PROMPTS: Record<string, (ctx: AnalysisRequest["context"]) => string> = {
  swot: (ctx) => `あなたはWEB制作会社のディレクターです。以下のヒアリング情報をもとに、クライアントのSWOT分析を提案してください。

【クライアント情報】
- 会社名: ${ctx.clientName || "未入力"}
- 業種: ${ctx.clientIndustry || "未入力"}
- 現在のサイト: ${ctx.clientUrl || "なし"}
- 現状の課題: ${ctx.currentSituation || "未入力"}
- 競合: ${ctx.competitors || "未入力"}
- ターゲット: ${ctx.targetUsers || "未入力"}
- サイト種別: ${ctx.siteType || "未入力"}

以下のJSON形式で回答してください（説明文や前置きは不要）:
{
  "strengths": "強み（箇条書き、改行区切り）",
  "weaknesses": "弱み（箇条書き、改行区切り）",
  "opportunities": "機会（箇条書き、改行区切り）",
  "threats": "脅威（箇条書き、改行区切り）"
}`,

  journey: (ctx) => `あなたはWEB制作会社のディレクターです。以下のヒアリング情報をもとに、ターゲットユーザーのカスタマージャーニー（認知→興味→比較検討→行動→リピート）を提案してください。

【クライアント情報】
- 会社名: ${ctx.clientName || "未入力"}
- 業種: ${ctx.clientIndustry || "未入力"}
- ターゲット: ${ctx.targetUsers || "未入力"}
- 現状の課題: ${ctx.currentSituation || "未入力"}
- プロジェクト目的: ${ctx.projectGoal || "未入力"}
- サイト種別: ${ctx.siteType || "未入力"}

以下のJSON形式で回答してください（説明文や前置きは不要）:
{
  "customerJourney": "認知→興味→比較検討→行動→リピートの各ステップを改行区切りで記載"
}`,

  kpi: (ctx) => `あなたはWEB制作会社のディレクターです。以下のヒアリング情報をもとに、KGI（最終目標）とKPI（中間指標）を提案してください。WEB制作の文脈で具体的な数値目標を含めてください。

【クライアント情報】
- 会社名: ${ctx.clientName || "未入力"}
- 業種: ${ctx.clientIndustry || "未入力"}
- ターゲット: ${ctx.targetUsers || "未入力"}
- 現状の課題: ${ctx.currentSituation || "未入力"}
- アクセス状況: ${ctx.currentSituation || "未入力"}
- プロジェクト目的: ${ctx.projectGoal || "未入力"}
- サイト種別: ${ctx.siteType || "未入力"}

以下のJSON形式で回答してください（説明文や前置きは不要）:
{
  "kgi": "KGI（最終目標）を具体的な数値を含めて記載",
  "kpi": "KPI（中間指標）を具体的な数値を含めて箇条書き",
  "monetization": "収益化方針の提案"
}`,

  brand: (ctx) => `あなたはWEB制作会社のディレクターです。以下のヒアリング情報をもとに、ブランドメッセージとトンマナ（トーン＆マナー）を提案してください。

【クライアント情報】
- 会社名: ${ctx.clientName || "未入力"}
- 業種: ${ctx.clientIndustry || "未入力"}
- ターゲット: ${ctx.targetUsers || "未入力"}
- 強み: ${ctx.strengths || "未入力"}
- 現状の課題: ${ctx.currentSituation || "未入力"}
- サイト種別: ${ctx.siteType || "未入力"}

以下のJSON形式で回答してください（説明文や前置きは不要）:
{
  "brandMessage": "ブランドメッセージ・トンマナの提案（デザインの方向性、カラー、フォントの雰囲気も含む）"
}`,
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalysisRequest;

    if (!PROMPTS[body.type]) {
      return NextResponse.json({ error: "無効な分析タイプです" }, { status: 400 });
    }

    const prompt = PROMPTS[body.type](body.context);

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // JSONを抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "AI応答の解析に失敗しました" }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI分析中にエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
