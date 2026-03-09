import type { SitemapNode } from "@/types/sitemap-generator";

function node(
  name: string,
  slug: string,
  icon: string,
  description: string,
  children: SitemapNode[] = []
): SitemapNode {
  return {
    id: crypto.randomUUID(),
    name,
    slug,
    icon,
    description,
    children,
  };
}

export const TEMPLATES: { label: string; pages: SitemapNode[] }[] = [
  {
    label: "コーポレートサイト",
    pages: [
      node("トップページ", "/", "🏠", "メインビジュアル・事業概要・新着情報"),
      node("会社概要", "/about", "🏢", "企業情報・代表挨拶・沿革", [
        node("代表メッセージ", "/about/message", "💬", "代表挨拶・ビジョン"),
        node("アクセス", "/about/access", "📍", "所在地・地図"),
      ]),
      node("事業内容", "/service", "💼", "事業・サービス一覧", [
        node("サービスA", "/service/a", "⚡", "サービス詳細A"),
        node("サービスB", "/service/b", "⚡", "サービス詳細B"),
      ]),
      node("実績・事例", "/works", "🏆", "制作実績・導入事例"),
      node("お知らせ", "/news", "📰", "ニュース・プレスリリース"),
      node("採用情報", "/recruit", "👥", "求人・エントリー"),
      node("お問い合わせ", "/contact", "✉️", "フォーム・連絡先"),
      node("プライバシーポリシー", "/privacy", "🔒", "個人情報保護方針"),
    ],
  },
  {
    label: "ECサイト",
    pages: [
      node("トップページ", "/", "🏠", "おすすめ商品・セール情報"),
      node("商品一覧", "/products", "🛍️", "カテゴリ別商品一覧", [
        node("カテゴリA", "/products/category-a", "📦", "商品カテゴリA"),
        node("カテゴリB", "/products/category-b", "📦", "商品カテゴリB"),
        node("商品詳細", "/products/[id]", "🏷️", "個別商品ページ"),
      ]),
      node("カート", "/cart", "🛒", "ショッピングカート"),
      node("会員登録・ログイン", "/auth", "👤", "会員機能", [
        node("マイページ", "/mypage", "📋", "注文履歴・お気に入り"),
      ]),
      node("ご利用ガイド", "/guide", "📖", "送料・返品・お支払い方法"),
      node("お問い合わせ", "/contact", "✉️", "フォーム"),
      node("特定商取引法", "/tokusho", "📄", "法的表示"),
      node("プライバシーポリシー", "/privacy", "🔒", "個人情報保護方針"),
    ],
  },
  {
    label: "ポートフォリオサイト",
    pages: [
      node("トップページ", "/", "🏠", "自己紹介・注目作品"),
      node("作品一覧", "/works", "🎨", "制作物ギャラリー", [
        node("作品詳細", "/works/[id]", "🖼️", "個別作品ページ"),
      ]),
      node("プロフィール", "/about", "👤", "経歴・スキル"),
      node("ブログ", "/blog", "✍️", "技術記事・活動報告", [
        node("記事詳細", "/blog/[slug]", "📝", "個別記事ページ"),
      ]),
      node("お問い合わせ", "/contact", "✉️", "フォーム・SNSリンク"),
    ],
  },
  {
    label: "LP（ランディングページ）",
    pages: [
      node("メインLP", "/", "🎯", "ヒーロー・特徴・料金・CTA", [
        node("ヒーローセクション", "#hero", "🌟", "キャッチコピー・メインビジュアル"),
        node("特徴・強み", "#features", "💡", "サービスの特徴3〜5点"),
        node("料金プラン", "#pricing", "💰", "プラン比較表"),
        node("お客様の声", "#testimonials", "💬", "導入事例・レビュー"),
        node("よくある質問", "#faq", "❓", "FAQ アコーディオン"),
        node("お問い合わせ", "#contact", "📩", "CTA・フォーム"),
      ]),
      node("サンクスページ", "/thanks", "🎉", "フォーム送信完了"),
      node("プライバシーポリシー", "/privacy", "🔒", "個人情報保護方針"),
    ],
  },
];
