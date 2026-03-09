import { AppLayout } from "@/components/layout/AppLayout";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          ダッシュボード
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          WEB制作の進行を一元管理
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="進行中の案件" value="0" />
          <StatCard title="今月の納品" value="0" />
          <StatCard title="レビュー待ち" value="0" />
        </div>

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            最近のアクティビティ
          </h2>
          <p className="mt-4 text-sm text-zinc-400">
            まだアクティビティはありません
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {title}
      </p>
      <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
    </div>
  );
}
