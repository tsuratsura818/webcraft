# CLAUDE.md — WebCraft プロジェクト

## 概要
WEB制作会社のディレクション〜コーディングを補助する統合ツール

## 技術スタック
- **フレームワーク**: Next.js 16 (App Router) + TypeScript
- **スタイル**: Tailwind CSS v4
- **パッケージマネージャ**: pnpm
- **デプロイ**: Vercel

## ディレクトリ構成
```
src/
  app/           # App Router ページ
  components/
    layout/      # レイアウト系（Sidebar, AppLayout）
    ui/          # 汎用UIコンポーネント
  lib/           # ユーティリティ・ビジネスロジック
  types/         # 型定義
```

## 開発コマンド
```bash
pnpm dev      # 開発サーバー起動
pnpm build    # ビルド
pnpm lint     # Lint実行
```

## ルール
- 親ディレクトリの `CLAUDE.md` のルールに従う
- コンポーネントは `components/` 配下に配置
- ページコンポーネントには `AppLayout` を使用する
- DB導入時は Prisma + Supabase PostgreSQL を使用予定
