export interface ProposalData {
  sitemap: string; // ディレクトリマップ（マークダウン形式のツリー）
  wireframes: string; // 全ページのワイヤーフレーム（HTML）
  topDesign: string; // TOPページデザイン案（HTML/CSS）
  schedule: string; // スケジュール案（マークダウンテーブル）
  clientTasks: string; // クライアント必要タスク（チェックリスト）
}

export type ProposalSection = keyof ProposalData;

export const PROPOSAL_SECTIONS: {
  key: ProposalSection;
  label: string;
  icon: string;
}[] = [
  { key: "sitemap", label: "ディレクトリマップ", icon: "🗺️" },
  { key: "wireframes", label: "ワイヤーフレーム", icon: "📐" },
  { key: "topDesign", label: "TOPページデザイン案", icon: "🎨" },
  { key: "schedule", label: "スケジュール案", icon: "📅" },
  { key: "clientTasks", label: "クライアントタスク", icon: "✅" },
];
