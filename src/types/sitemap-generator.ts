export interface SitemapNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
  children: SitemapNode[];
}

export interface SitemapProject {
  siteName: string;
  clientName: string;
  companyName: string;
  createdAt: string;
  themeColor: string;
  memo: string;
  pages: SitemapNode[];
}

export const THEME_COLORS = [
  { name: "ブルー", value: "#3b82f6" },
  { name: "グリーン", value: "#22c55e" },
  { name: "パープル", value: "#8b5cf6" },
  { name: "レッド", value: "#ef4444" },
  { name: "オレンジ", value: "#f97316" },
  { name: "ピンク", value: "#ec4899" },
  { name: "ティール", value: "#14b8a6" },
  { name: "スレート", value: "#64748b" },
] as const;
