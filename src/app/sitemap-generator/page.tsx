"use client";

import { useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import type { SitemapNode, SitemapProject } from "@/types/sitemap-generator";
import { THEME_COLORS } from "@/types/sitemap-generator";
import { TEMPLATES } from "@/lib/sitemap-generator/templates";
import { generateExportHtml } from "@/lib/sitemap-generator/export-html";

const defaultProject: SitemapProject = {
  siteName: "",
  clientName: "",
  companyName: "",
  createdAt: new Date().toISOString().slice(0, 10),
  themeColor: "#3b82f6",
  memo: "",
  pages: [],
};

function createNode(): SitemapNode {
  return {
    id: crypto.randomUUID(),
    name: "新しいページ",
    description: "",
    icon: "📄",
    slug: "/new-page",
    children: [],
  };
}

// 再帰的にノードを更新するヘルパー
function updateNodeInTree(
  nodes: SitemapNode[],
  id: string,
  updater: (node: SitemapNode) => SitemapNode
): SitemapNode[] {
  return nodes.map((n) => {
    if (n.id === id) return updater(n);
    return { ...n, children: updateNodeInTree(n.children, id, updater) };
  });
}

function removeNodeFromTree(nodes: SitemapNode[], id: string): SitemapNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({ ...n, children: removeNodeFromTree(n.children, id) }));
}

function addChildToNode(
  nodes: SitemapNode[],
  parentId: string,
  child: SitemapNode
): SitemapNode[] {
  return nodes.map((n) => {
    if (n.id === parentId) {
      return { ...n, children: [...n.children, child] };
    }
    return { ...n, children: addChildToNode(n.children, parentId, child) };
  });
}

function moveNode(
  nodes: SitemapNode[],
  id: string,
  direction: "up" | "down"
): SitemapNode[] {
  const idx = nodes.findIndex((n) => n.id === id);
  if (idx !== -1) {
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= nodes.length) return nodes;
    const copy = [...nodes];
    [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
    return copy;
  }
  return nodes.map((n) => ({
    ...n,
    children: moveNode(n.children, id, direction),
  }));
}

function countNodes(nodes: SitemapNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countNodes(n.children), 0);
}

export default function SitemapGeneratorPage() {
  const [project, setProject] = useState<SitemapProject>(defaultProject);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  const updateProject = useCallback(
    (partial: Partial<SitemapProject>) =>
      setProject((prev) => ({ ...prev, ...partial })),
    []
  );

  const handleAddPage = useCallback(() => {
    setProject((prev) => ({
      ...prev,
      pages: [...prev.pages, createNode()],
    }));
  }, []);

  const handleAddChild = useCallback((parentId: string) => {
    setProject((prev) => ({
      ...prev,
      pages: addChildToNode(prev.pages, parentId, createNode()),
    }));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setProject((prev) => ({
      ...prev,
      pages: removeNodeFromTree(prev.pages, id),
    }));
  }, []);

  const handleUpdate = useCallback(
    (id: string, partial: Partial<SitemapNode>) => {
      setProject((prev) => ({
        ...prev,
        pages: updateNodeInTree(prev.pages, id, (n) => ({ ...n, ...partial })),
      }));
    },
    []
  );

  const handleMove = useCallback((id: string, direction: "up" | "down") => {
    setProject((prev) => ({
      ...prev,
      pages: moveNode(prev.pages, id, direction),
    }));
  }, []);

  const handleLoadTemplate = useCallback((index: number) => {
    const tmpl = TEMPLATES[index];
    setProject((prev) => ({ ...prev, pages: tmpl.pages }));
  }, []);

  const handleReset = useCallback(() => {
    setProject(defaultProject);
  }, []);

  const handleExportHtml = useCallback(() => {
    const html = generateExportHtml(project);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sitemap_${project.siteName || "export"}_${new Date().toISOString().slice(0, 10)}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [project]);

  const handlePrint = useCallback(() => {
    const html = generateExportHtml(project);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  }, [project]);

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              サイトマップジェネレーター
            </h1>
            <p className="text-sm text-zinc-500">
              ページ構成を設計してHTML/PDFで出力
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportHtml}
              disabled={project.pages.length === 0}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              HTML出力
            </button>
            <button
              onClick={handlePrint}
              disabled={project.pages.length === 0}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              PDF（印刷）
            </button>
          </div>
        </div>

        {/* モバイルタブ */}
        <div className="flex border-b border-zinc-200 lg:hidden dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("editor")}
            className={`flex-1 py-3 text-center text-sm font-medium ${activeTab === "editor" ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50" : "text-zinc-500"}`}
          >
            ページ構成
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex-1 py-3 text-center text-sm font-medium ${activeTab === "preview" ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50" : "text-zinc-500"}`}
          >
            プレビュー
          </button>
        </div>

        {/* メインコンテンツ */}
        <div className="flex flex-1 overflow-hidden">
          {/* 左: エディタ */}
          <div
            className={`w-full flex-shrink-0 overflow-y-auto border-r border-zinc-200 p-5 lg:w-[400px] dark:border-zinc-800 ${activeTab !== "editor" ? "hidden lg:block" : ""}`}
          >
            {/* プロジェクト設定 */}
            <details open className="mb-5">
              <summary className="mb-3 cursor-pointer text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                プロジェクト設定
              </summary>
              <div className="space-y-3">
                <Input
                  label="サイト名"
                  value={project.siteName}
                  onChange={(v) => updateProject({ siteName: v })}
                  placeholder="例: 株式会社〇〇 コーポレートサイト"
                />
                <Input
                  label="クライアント名"
                  value={project.clientName}
                  onChange={(v) => updateProject({ clientName: v })}
                  placeholder="例: 株式会社〇〇"
                />
                <Input
                  label="制作会社名"
                  value={project.companyName}
                  onChange={(v) => updateProject({ companyName: v })}
                  placeholder="例: 株式会社△△"
                />
                <Input
                  label="作成日"
                  value={project.createdAt}
                  onChange={(v) => updateProject({ createdAt: v })}
                  type="date"
                />
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    テーマカラー
                  </label>
                  <div className="flex gap-2">
                    {THEME_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => updateProject({ themeColor: c.value })}
                        className={`h-7 w-7 rounded-full border-2 transition-transform ${project.themeColor === c.value ? "scale-110 border-zinc-900 dark:border-zinc-100" : "border-transparent"}`}
                        style={{ background: c.value }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    備考メモ
                  </label>
                  <textarea
                    value={project.memo}
                    onChange={(e) => updateProject({ memo: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    placeholder="メモ（出力時に表示されます）"
                  />
                </div>
              </div>
            </details>

            {/* テンプレート */}
            <details className="mb-5">
              <summary className="mb-3 cursor-pointer text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                テンプレートから作成
              </summary>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map((t, i) => (
                  <button
                    key={t.label}
                    onClick={() => handleLoadTemplate(i)}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </details>

            {/* ページ一覧 */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                ページ一覧（{countNodes(project.pages)}件）
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  リセット
                </button>
                <button
                  onClick={handleAddPage}
                  className="rounded-md bg-zinc-900 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  + ページ追加
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <NodeList
                nodes={project.pages}
                depth={0}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
                onAddChild={handleAddChild}
                onMove={handleMove}
              />
            </div>
          </div>

          {/* 右: プレビュー */}
          <div
            className={`flex-1 overflow-y-auto bg-zinc-100 p-6 dark:bg-zinc-900/50 ${activeTab !== "preview" ? "hidden lg:block" : ""}`}
          >
            {project.pages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                テンプレートを選択するか、ページを追加してください
              </div>
            ) : (
              <PreviewTree project={project} />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// --- サブコンポーネント ---

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
    </div>
  );
}

function NodeList({
  nodes,
  depth,
  onUpdate,
  onRemove,
  onAddChild,
  onMove,
}: {
  nodes: SitemapNode[];
  depth: number;
  onUpdate: (id: string, partial: Partial<SitemapNode>) => void;
  onRemove: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}) {
  return (
    <>
      {nodes.map((node) => (
        <NodeEditor
          key={node.id}
          node={node}
          depth={depth}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onAddChild={onAddChild}
          onMove={onMove}
        />
      ))}
    </>
  );
}

function NodeEditor({
  node,
  depth,
  onUpdate,
  onRemove,
  onAddChild,
  onMove,
}: {
  node: SitemapNode;
  depth: number;
  onUpdate: (id: string, partial: Partial<SitemapNode>) => void;
  onRemove: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div className="mb-1 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
        {/* ヘッダー行 */}
        <div className="flex items-center gap-2">
          <span className="text-base">{node.icon}</span>
          <input
            value={node.name}
            onChange={(e) => onUpdate(node.id, { name: e.target.value })}
            className="flex-1 bg-transparent text-sm font-medium focus:outline-none dark:text-zinc-100"
          />
          <button
            onClick={() => setOpen(!open)}
            className="text-xs text-zinc-400 hover:text-zinc-600"
          >
            {open ? "▲" : "▼"}
          </button>
          <button
            onClick={() => onMove(node.id, "up")}
            className="text-xs text-zinc-400 hover:text-zinc-600"
            title="上に移動"
          >
            ↑
          </button>
          <button
            onClick={() => onMove(node.id, "down")}
            className="text-xs text-zinc-400 hover:text-zinc-600"
            title="下に移動"
          >
            ↓
          </button>
          <button
            onClick={() => onAddChild(node.id)}
            className="text-xs text-blue-500 hover:text-blue-600"
            title="子ページ追加"
          >
            +子
          </button>
          <button
            onClick={() => onRemove(node.id)}
            className="text-xs text-red-400 hover:text-red-500"
            title="削除"
          >
            ✕
          </button>
        </div>

        {/* 詳細 */}
        {open && (
          <div className="mt-2 space-y-2 border-t border-zinc-100 pt-2 dark:border-zinc-800">
            <div className="flex gap-2">
              <div className="w-16">
                <label className="text-[10px] text-zinc-400">アイコン</label>
                <input
                  value={node.icon}
                  onChange={(e) => onUpdate(node.id, { icon: e.target.value })}
                  className="w-full rounded border border-zinc-200 px-2 py-1 text-center text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-zinc-400">スラッグ</label>
                <input
                  value={node.slug}
                  onChange={(e) => onUpdate(node.id, { slug: e.target.value })}
                  className="w-full rounded border border-zinc-200 px-2 py-1 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-zinc-400">説明</label>
              <input
                value={node.description}
                onChange={(e) =>
                  onUpdate(node.id, { description: e.target.value })
                }
                className="w-full rounded border border-zinc-200 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="ページの概要"
              />
            </div>
          </div>
        )}
      </div>

      {/* 子ノード */}
      {node.children.length > 0 && (
        <NodeList
          nodes={node.children}
          depth={depth + 1}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onAddChild={onAddChild}
          onMove={onMove}
        />
      )}
    </div>
  );
}

function PreviewTree({ project }: { project: SitemapProject }) {
  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-6">
        <h2
          className="text-xl font-bold"
          style={{ color: project.themeColor }}
        >
          {project.siteName || "サイトマップ"}
        </h2>
        <div className="mt-1 flex flex-wrap gap-4 text-xs text-zinc-500">
          {project.clientName && <span>クライアント: {project.clientName}</span>}
          {project.companyName && <span>制作: {project.companyName}</span>}
          <span>作成日: {project.createdAt}</span>
        </div>
        {project.memo && (
          <p className="mt-3 rounded-lg bg-zinc-200/50 px-4 py-2 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {project.memo}
          </p>
        )}
      </div>

      {/* ツリー */}
      <PreviewNodeList nodes={project.pages} color={project.themeColor} />
    </div>
  );
}

function PreviewNodeList({
  nodes,
  color,
}: {
  nodes: SitemapNode[];
  color: string;
}) {
  return (
    <ul className="space-y-1 border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
      {nodes.map((node) => (
        <li key={node.id}>
          <div
            className="group inline-flex items-start gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 transition-colors dark:border-zinc-700 dark:bg-zinc-900"
            style={{ borderLeftColor: color, borderLeftWidth: 3 }}
          >
            <span className="text-base">{node.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {node.name}
                </span>
                {node.slug && (
                  <span className="font-mono text-[11px] text-zinc-400">
                    {node.slug}
                  </span>
                )}
              </div>
              {node.description && (
                <p className="text-xs text-zinc-500">{node.description}</p>
              )}
            </div>
          </div>
          {node.children.length > 0 && (
            <div className="mt-1">
              <PreviewNodeList nodes={node.children} color={color} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
