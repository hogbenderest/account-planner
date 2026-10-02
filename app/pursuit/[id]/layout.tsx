import { notFound } from "next/navigation";
import { getPursuit } from "@/src/lib/db";
import { PursuitNav } from "@/src/components/PursuitNav";

export default async function PursuitLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pursuit = await getPursuit(id);
  if (!pursuit) notFound();

  return (
    <div className="min-h-screen bg-cf-canvas lg:flex">
      <aside className="bg-cf-navy px-4 py-5 lg:w-64 lg:shrink-0">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cf-orange text-base font-black text-white">A</span>
          <span className="text-sm font-bold text-white">Account Planner</span>
        </div>
        <PursuitNav pursuitId={pursuit.id} />
      </aside>
      <div className="min-w-0 flex-1">
        <header className="border-b border-cf-border bg-white px-6 py-3">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-1 text-xs text-cf-muted">
            <span>
              <strong className="font-semibold text-cf-ink">Account:</strong> {pursuit.accountName || "—"}
            </span>
            <span>
              <strong className="font-semibold text-cf-ink">Parent:</strong> {pursuit.parentAccount || "—"}
            </span>
            <span>
              <strong className="font-semibold text-cf-ink">Salesperson:</strong> {pursuit.leadSalesperson || "—"}
            </span>
            <span>
              <strong className="font-semibold text-cf-ink">Offering:</strong> {pursuit.proposedOffering || "—"}
            </span>
            <span>
              <strong className="font-semibold text-cf-ink">Phase:</strong> {pursuit.phase || "—"}
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
