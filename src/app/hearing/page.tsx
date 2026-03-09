"use client";

import { useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import type { HearingSheet } from "@/types/hearing";
import {
  createEmptyHearing,
  PHASES,
  SITE_TYPES,
  FEATURE_OPTIONS,
  SNS_OPTIONS,
  MATERIAL_OPTIONS,
  CMS_OPTIONS,
  BUDGET_RANGES,
} from "@/types/hearing";
import {
  generateHearingHtml,
  generateHearingCsv,
  generateHearingTsv,
} from "@/lib/hearing/export";

export default function HearingPage() {
  const [data, setData] = useState<HearingSheet>(createEmptyHearing());
  const [phase, setPhase] = useState(0);

  const update = useCallback(
    (partial: Partial<HearingSheet>) =>
      setData((prev) => ({ ...prev, ...partial, updatedAt: new Date().toISOString().slice(0, 10) })),
    []
  );

  const toggleArray = useCallback(
    (key: "features" | "snsIntegration" | "materialsProvided", value: string) => {
      setData((prev) => {
        const arr = prev[key];
        return {
          ...prev,
          [key]: arr.includes(value)
            ? arr.filter((v) => v !== value)
            : [...arr, value],
          updatedAt: new Date().toISOString().slice(0, 10),
        };
      });
    },
    []
  );

  const download = useCallback(
    (type: "html" | "csv" | "tsv") => {
      let content: string;
      let mime: string;
      let ext: string;
      if (type === "html") {
        content = generateHearingHtml(data);
        mime = "text/html;charset=utf-8";
        ext = "html";
      } else if (type === "csv") {
        content = generateHearingCsv(data);
        mime = "text/csv;charset=utf-8";
        ext = "csv";
      } else {
        content = generateHearingTsv(data);
        mime = "text/tab-separated-values;charset=utf-8";
        ext = "tsv";
      }
      const blob = new Blob([content], { type: mime });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `hearing_${data.clientName || "draft"}_${data.updatedAt}.${ext}`;
      link.click();
      URL.revokeObjectURL(link.href);
    },
    [data]
  );

  const printHtml = useCallback(() => {
    const html = generateHearingHtml(data);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  }, [data]);

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              ヒアリングシート
            </h1>
            <p className="text-sm text-zinc-500">
              制作案件のヒアリング → 要件定義 → 計画書出力
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => download("csv")} className="btn-outline">CSV</button>
            <button onClick={() => download("tsv")} className="btn-outline">TSV</button>
            <button onClick={() => download("html")} className="btn-outline">HTML</button>
            <button onClick={printHtml} className="btn-primary">PDF</button>
          </div>
        </div>

        {/* ステップナビ */}
        <div className="overflow-x-auto border-b border-zinc-200 bg-zinc-50 px-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex min-w-max">
            {PHASES.map((p, i) => (
              <button
                key={p.key}
                onClick={() => setPhase(i)}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
                  phase === i
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                <span>{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* フォーム */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-2xl">
            {phase === 0 && <PhaseBasic data={data} update={update} />}
            {phase === 1 && <PhaseAnalysis data={data} update={update} />}
            {phase === 2 && <PhaseStrategy data={data} update={update} />}
            {phase === 3 && (
              <PhaseRequirements data={data} update={update} toggleArray={toggleArray} />
            )}
            {phase === 4 && <PhaseDesign data={data} update={update} />}
            {phase === 5 && <PhaseSchedule data={data} update={update} />}
            {phase === 6 && (
              <PhaseOperation data={data} update={update} toggleArray={toggleArray} />
            )}

            {/* ナビボタン */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setPhase((p) => Math.max(0, p - 1))}
                disabled={phase === 0}
                className="btn-outline disabled:opacity-30"
              >
                前へ
              </button>
              {phase < PHASES.length - 1 ? (
                <button
                  onClick={() => setPhase((p) => p + 1)}
                  className="btn-primary"
                >
                  次へ
                </button>
              ) : (
                <button
                  onClick={() => update({ status: "completed" })}
                  className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-500"
                >
                  完了にする
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn-outline {
          border-radius: 0.5rem;
          border: 1px solid #d4d4d8;
          background: #fff;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #3f3f46;
          transition: background 0.15s;
        }
        .btn-outline:hover { background: #f4f4f5; }
        .btn-primary {
          border-radius: 0.5rem;
          background: #18181b;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #fff;
          transition: background 0.15s;
        }
        .btn-primary:hover { background: #3f3f46; }
        @media (prefers-color-scheme: dark) {
          .btn-outline { border-color: #3f3f46; background: #18181b; color: #d4d4d8; }
          .btn-outline:hover { background: #27272a; }
          .btn-primary { background: #f4f4f5; color: #18181b; }
          .btn-primary:hover { background: #d4d4d8; }
        }
      `}</style>
    </AppLayout>
  );
}

// --- 共通UIパーツ ---

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {hint && <p className="mb-1.5 text-xs text-zinc-400">{hint}</p>}
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder = "選択してください",
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function CheckboxGroup({
  options,
  selected,
  onToggle,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onToggle(o)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            selected.includes(o)
              ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-zinc-300 text-blue-500 focus:ring-blue-500"
      />
      <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 border-b border-zinc-200 pb-2 text-base font-bold text-zinc-800 dark:border-zinc-700 dark:text-zinc-100">
      {children}
    </h2>
  );
}

// --- フェーズ別コンポーネント ---

interface PhaseProps {
  data: HearingSheet;
  update: (partial: Partial<HearingSheet>) => void;
}

interface PhaseWithArrayProps extends PhaseProps {
  toggleArray: (key: "features" | "snsIntegration" | "materialsProvided", value: string) => void;
}

function PhaseBasic({ data, update }: PhaseProps) {
  return (
    <div>
      <SectionTitle>📋 クライアント基本情報</SectionTitle>
      <Field label="会社名・団体名">
        <TextInput value={data.clientName} onChange={(v) => update({ clientName: v })} placeholder="株式会社〇〇" />
      </Field>
      <Field label="業種">
        <TextInput value={data.clientIndustry} onChange={(v) => update({ clientIndustry: v })} placeholder="IT / 飲食 / 美容 / 不動産 など" />
      </Field>
      <Field label="現在のサイトURL" hint="既存サイトがある場合">
        <TextInput value={data.clientUrl} onChange={(v) => update({ clientUrl: v })} placeholder="https://example.com" />
      </Field>
      <Field label="ご担当者名">
        <TextInput value={data.contactPerson} onChange={(v) => update({ contactPerson: v })} placeholder="山田 太郎" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="メールアドレス">
          <TextInput value={data.contactEmail} onChange={(v) => update({ contactEmail: v })} placeholder="info@example.com" type="email" />
        </Field>
        <Field label="電話番号">
          <TextInput value={data.contactPhone} onChange={(v) => update({ contactPhone: v })} placeholder="03-1234-5678" type="tel" />
        </Field>
      </div>
    </div>
  );
}

function PhaseAnalysis({ data, update }: PhaseProps) {
  return (
    <div>
      <SectionTitle>🔍 現状分析</SectionTitle>
      <Field label="現状の課題・背景" hint="サイトリニューアルや新規制作の背景をお聞かせください">
        <TextArea value={data.currentSituation} onChange={(v) => update({ currentSituation: v })} placeholder="例: 5年前に制作したサイトがスマホ未対応で、問い合わせが減少している" rows={4} />
      </Field>
      <Field label="競合サイト" hint="ベンチマークとなる競合サイトのURL">
        <TextArea value={data.competitors} onChange={(v) => update({ competitors: v })} placeholder="https://competitor1.com&#10;https://competitor2.com" rows={3} />
      </Field>
      <Field label="既存資料" hint="会社案内、パンフレット、ブランドガイドライン等">
        <TextArea value={data.existingMaterials} onChange={(v) => update({ existingMaterials: v })} placeholder="会社案内PDF、ロゴデータ（AI）あり" />
      </Field>
      <Field label="アクセス状況" hint="Google Analyticsの数値等があれば">
        <TextArea value={data.accessAnalysis} onChange={(v) => update({ accessAnalysis: v })} placeholder="月間PV: 約5,000 / 直帰率: 70%" />
      </Field>

      <h3 className="mb-3 mt-6 text-sm font-semibold text-zinc-700 dark:text-zinc-300">SWOT分析</h3>
      <div className="grid grid-cols-2 gap-4">
        <Field label="強み (Strengths)">
          <TextArea value={data.strengths} onChange={(v) => update({ strengths: v })} placeholder="技術力、実績、ブランド認知" rows={3} />
        </Field>
        <Field label="弱み (Weaknesses)">
          <TextArea value={data.weaknesses} onChange={(v) => update({ weaknesses: v })} placeholder="Web集客が弱い、更新が止まっている" rows={3} />
        </Field>
        <Field label="機会 (Opportunities)">
          <TextArea value={data.opportunities} onChange={(v) => update({ opportunities: v })} placeholder="市場の成長、DX推進の流れ" rows={3} />
        </Field>
        <Field label="脅威 (Threats)">
          <TextArea value={data.threats} onChange={(v) => update({ threats: v })} placeholder="競合の台頭、法規制の変更" rows={3} />
        </Field>
      </div>
    </div>
  );
}

function PhaseStrategy({ data, update }: PhaseProps) {
  return (
    <div>
      <SectionTitle>🎯 ターゲット・戦略立案</SectionTitle>

      <Field label="ターゲットユーザー" hint="メインターゲットとなるユーザー像">
        <TextArea value={data.targetUsers} onChange={(v) => update({ targetUsers: v })} placeholder="例: 30〜40代の中小企業経営者、IT導入を検討中" />
      </Field>

      <h3 className="mb-3 mt-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">ペルソナ</h3>
      <div className="grid grid-cols-3 gap-3">
        <Field label="年齢層">
          <TextInput value={data.personaAge} onChange={(v) => update({ personaAge: v })} placeholder="30〜40代" />
        </Field>
        <Field label="性別">
          <TextInput value={data.personaGender} onChange={(v) => update({ personaGender: v })} placeholder="男性 / 女性 / 問わず" />
        </Field>
        <Field label="職業">
          <TextInput value={data.personaOccupation} onChange={(v) => update({ personaOccupation: v })} placeholder="会社経営者" />
        </Field>
      </div>
      <Field label="ニーズ・課題">
        <TextArea value={data.personaNeeds} onChange={(v) => update({ personaNeeds: v })} placeholder="信頼できるWeb制作会社を探している / コスト感を知りたい" />
      </Field>
      <Field label="カスタマージャーニー" hint="認知→興味→比較→行動の流れ">
        <TextArea value={data.customerJourney} onChange={(v) => update({ customerJourney: v })} placeholder="Google検索 → サービスページ閲覧 → 実績確認 → 問い合わせ" rows={3} />
      </Field>

      <h3 className="mb-3 mt-6 text-sm font-semibold text-zinc-700 dark:text-zinc-300">ブランディング・KPI</h3>
      <Field label="ブランドメッセージ・トンマナ">
        <TextArea value={data.brandMessage} onChange={(v) => update({ brandMessage: v })} placeholder="信頼感、誠実さ、先進的なイメージ / カラー: ネイビー系" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="KGI（最終目標）">
          <TextArea value={data.kgi} onChange={(v) => update({ kgi: v })} placeholder="月間問い合わせ数 30件" />
        </Field>
        <Field label="KPI（中間指標）">
          <TextArea value={data.kpi} onChange={(v) => update({ kpi: v })} placeholder="月間PV 10,000 / CVR 3%" />
        </Field>
      </div>
      <Field label="収益化方針">
        <TextArea value={data.monetization} onChange={(v) => update({ monetization: v })} placeholder="問い合わせ経由の受注 / ECでの直接販売" />
      </Field>
    </div>
  );
}

function PhaseRequirements({ data, update, toggleArray }: PhaseWithArrayProps) {
  return (
    <div>
      <SectionTitle>📐 要件定義</SectionTitle>
      <Field label="プロジェクトの目的・ゴール">
        <TextArea value={data.projectGoal} onChange={(v) => update({ projectGoal: v })} placeholder="問い合わせ数の増加 / ブランドイメージの刷新 / EC売上向上" rows={3} />
      </Field>
      <Field label="サイト種別">
        <SelectInput value={data.siteType} onChange={(v) => update({ siteType: v })} options={SITE_TYPES} />
      </Field>
      <Field label="必要なページ" hint="大まかなページ構成">
        <TextArea value={data.requiredPages} onChange={(v) => update({ requiredPages: v })} placeholder="トップ / 会社概要 / サービス / 実績 / お知らせ / 問い合わせ" rows={3} />
      </Field>
      <Field label="必要な機能" hint="該当するものを選択">
        <CheckboxGroup options={FEATURE_OPTIONS} selected={data.features} onToggle={(v) => toggleArray("features", v)} />
      </Field>
      <Field label="CMS（管理システム）">
        <SelectInput value={data.cmsType} onChange={(v) => update({ cmsType: v })} options={CMS_OPTIONS} />
      </Field>
      <Field label="SNS連携">
        <CheckboxGroup options={SNS_OPTIONS} selected={data.snsIntegration} onToggle={(v) => toggleArray("snsIntegration", v)} />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Toggle label="レスポンシブ対応" checked={data.responsiveRequired} onChange={(v) => update({ responsiveRequired: v })} />
        <Toggle label="SEO対策" checked={data.seoRequired} onChange={(v) => update({ seoRequired: v })} />
        <Toggle label="アクセス解析" checked={data.analyticsRequired} onChange={(v) => update({ analyticsRequired: v })} />
      </div>
    </div>
  );
}

function PhaseDesign({ data, update }: PhaseProps) {
  return (
    <div>
      <SectionTitle>🎨 デザイン</SectionTitle>
      <Field label="デザインの方向性" hint="雰囲気、カラー、フォント等のイメージ">
        <TextArea value={data.designPreference} onChange={(v) => update({ designPreference: v })} placeholder="シンプル・クリーン / 高級感 / ポップ・カジュアル / 和モダン&#10;メインカラー: ネイビー / サブカラー: ゴールド" rows={4} />
      </Field>
      <Field label="参考サイトURL" hint="「このサイトの雰囲気が好き」等">
        <TextArea value={data.referenceUrls} onChange={(v) => update({ referenceUrls: v })} placeholder="https://example1.com（レイアウトが好み）&#10;https://example2.com（色合いが参考になる）" rows={4} />
      </Field>
    </div>
  );
}

function PhaseSchedule({ data, update }: PhaseProps) {
  return (
    <div>
      <SectionTitle>📅 予算・スケジュール</SectionTitle>
      <Field label="ご予算">
        <SelectInput value={data.budgetRange} onChange={(v) => update({ budgetRange: v })} options={BUDGET_RANGES} />
      </Field>
      <Field label="希望公開日">
        <TextInput value={data.desiredLaunch} onChange={(v) => update({ desiredLaunch: v })} type="date" />
      </Field>
      <Field label="優先事項" hint="品質・スピード・コストのどれを優先するか">
        <TextArea value={data.priority} onChange={(v) => update({ priority: v })} placeholder="デザインクオリティ重視 / 公開スピード優先 / コスト最小化" />
      </Field>
    </div>
  );
}

function PhaseOperation({ data, update, toggleArray }: PhaseWithArrayProps) {
  return (
    <div>
      <SectionTitle>🔧 素材・運用・保守</SectionTitle>
      <Field label="提供いただける素材" hint="該当するものを選択">
        <CheckboxGroup options={MATERIAL_OPTIONS} selected={data.materialsProvided} onToggle={(v) => toggleArray("materialsProvided", v)} />
      </Field>
      <Field label="ライティング担当">
        <TextInput value={data.writingBy} onChange={(v) => update({ writingBy: v })} placeholder="クライアント側で用意 / 制作側で対応 / 共同作業" />
      </Field>
      <Field label="公開後の運用体制" hint="更新頻度、担当者など">
        <TextArea value={data.operationPlan} onChange={(v) => update({ operationPlan: v })} placeholder="月2回のお知らせ更新を社内で実施 / ブログ記事は外注" rows={3} />
      </Field>
      <Toggle label="保守・運用契約を希望する" checked={data.maintenanceRequired} onChange={(v) => update({ maintenanceRequired: v })} />

      <div className="mt-6">
        <Field label="備考・その他">
          <TextArea value={data.notes} onChange={(v) => update({ notes: v })} placeholder="その他ご要望やご質問があればご記入ください" rows={4} />
        </Field>
      </div>
    </div>
  );
}
