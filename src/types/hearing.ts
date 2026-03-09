// ヒアリングシートのデータ構造（制作フロー全フェーズ対応）

export interface HearingSheet {
  // === Phase 1: ヒアリング / 現状分析 ===
  // クライアント基本情報
  clientName: string;
  clientIndustry: string;
  clientUrl: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;

  // 現状と課題
  currentSituation: string; // 現状の課題・背景
  competitors: string; // 競合サイト（URL等）
  existingMaterials: string; // 既存資料の有無
  accessAnalysis: string; // 現在のアクセス状況
  strengths: string; // 強み（3C/SWOT）
  weaknesses: string; // 弱み
  opportunities: string; // 機会
  threats: string; // 脅威

  // === Phase 2: ブランディング / 企画・戦略立案 ===
  targetUsers: string; // ターゲットユーザー
  personaAge: string; // ペルソナ年齢層
  personaGender: string; // ペルソナ性別
  personaOccupation: string; // ペルソナ職業
  personaNeeds: string; // ペルソナのニーズ
  customerJourney: string; // カスタマージャーニー（認知→検討→行動）
  brandMessage: string; // ブランドメッセージ・トンマナ
  kgi: string; // KGI（最終目標）
  kpi: string; // KPI（中間指標）
  monetization: string; // 収益化方針

  // === Phase 3: 設計 / 要件定義 ===
  projectGoal: string; // プロジェクトの目的・ゴール
  siteType: string; // サイト種別
  requiredPages: string; // 必要なページ
  features: string[]; // 必要な機能
  cmsType: string; // CMS希望
  designPreference: string; // デザインの方向性
  referenceUrls: string; // 参考サイトURL
  responsiveRequired: boolean; // レスポンシブ対応
  seoRequired: boolean; // SEO対策
  analyticsRequired: boolean; // アクセス解析
  snsIntegration: string[]; // SNS連携

  // スケジュール・予算
  budgetRange: string; // 予算感
  desiredLaunch: string; // 希望公開日
  priority: string; // 優先事項

  // 素材・運用
  materialsProvided: string[]; // クライアント提供素材
  writingBy: string; // ライティング担当
  operationPlan: string; // 公開後の運用体制
  maintenanceRequired: boolean; // 保守契約希望

  // メタ
  createdAt: string;
  updatedAt: string;
  status: "draft" | "completed";
  notes: string;
}

export const SITE_TYPES = [
  "コーポレートサイト",
  "ECサイト",
  "LP（ランディングページ）",
  "メディア / ブログ",
  "ポートフォリオ",
  "採用サイト",
  "サービスサイト",
  "その他",
] as const;

export const FEATURE_OPTIONS = [
  "お問い合わせフォーム",
  "ブログ / お知らせ",
  "会員登録 / ログイン",
  "EC / カート機能",
  "予約システム",
  "チャット / チャットボット",
  "多言語対応",
  "動画埋め込み",
  "地図 / アクセスマップ",
  "FAQ / よくある質問",
  "資料ダウンロード",
  "メールマガジン連携",
  "SNSフィード表示",
  "検索機能",
  "管理画面（CMS）",
] as const;

export const SNS_OPTIONS = [
  "X (Twitter)",
  "Instagram",
  "Facebook",
  "LINE",
  "YouTube",
  "TikTok",
] as const;

export const MATERIAL_OPTIONS = [
  "ロゴデータ",
  "写真素材",
  "テキスト原稿",
  "パンフレット / チラシ",
  "ブランドガイドライン",
  "動画素材",
] as const;

export const CMS_OPTIONS = [
  "WordPress",
  "Shopify",
  "Next.js / ヘッドレスCMS",
  "Wix / STUDIO",
  "おまかせ",
  "CMS不要",
] as const;

export const BUDGET_RANGES = [
  "〜30万円",
  "30〜50万円",
  "50〜100万円",
  "100〜200万円",
  "200〜500万円",
  "500万円〜",
  "未定 / 要相談",
] as const;

export const PHASES = [
  { key: "basic", label: "基本情報", icon: "📋" },
  { key: "analysis", label: "現状分析", icon: "🔍" },
  { key: "strategy", label: "戦略立案", icon: "🎯" },
  { key: "requirements", label: "要件定義", icon: "📐" },
  { key: "design", label: "デザイン", icon: "🎨" },
  { key: "schedule", label: "予算・スケジュール", icon: "📅" },
  { key: "operation", label: "運用・保守", icon: "🔧" },
] as const;

export function createEmptyHearing(): HearingSheet {
  return {
    clientName: "",
    clientIndustry: "",
    clientUrl: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    currentSituation: "",
    competitors: "",
    existingMaterials: "",
    accessAnalysis: "",
    strengths: "",
    weaknesses: "",
    opportunities: "",
    threats: "",
    targetUsers: "",
    personaAge: "",
    personaGender: "",
    personaOccupation: "",
    personaNeeds: "",
    customerJourney: "",
    brandMessage: "",
    kgi: "",
    kpi: "",
    monetization: "",
    projectGoal: "",
    siteType: "",
    requiredPages: "",
    features: [],
    cmsType: "",
    designPreference: "",
    referenceUrls: "",
    responsiveRequired: true,
    seoRequired: true,
    analyticsRequired: true,
    snsIntegration: [],
    budgetRange: "",
    desiredLaunch: "",
    priority: "",
    materialsProvided: [],
    writingBy: "",
    operationPlan: "",
    maintenanceRequired: false,
    createdAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
    status: "draft",
    notes: "",
  };
}
