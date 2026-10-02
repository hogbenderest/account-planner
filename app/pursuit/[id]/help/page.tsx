import { notFound } from "next/navigation";
import { getPursuit } from "@/src/lib/db";
import { HelpContent } from "@/src/components/HelpContent";

/** Pursuit-scoped help: rendered inside the sidebar layout so navigation stays available. */
export default async function PursuitHelpPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pursuit = await getPursuit(id);
  if (!pursuit) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <HelpContent />
    </div>
  );
}
