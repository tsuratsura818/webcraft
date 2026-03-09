import { AppLayout } from "@/components/layout/AppLayout";

export default function ProjectsPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              案件管理
            </h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              制作案件の一覧と進捗管理
            </p>
          </div>
          <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
            新規案件
          </button>
        </div>

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-400">
            案件がまだ登録されていません。「新規案件」から追加してください。
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
