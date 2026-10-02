import { notFound } from "next/navigation";
import { getPursuit, listActionItems } from "@/src/lib/db";
import { PlannerTable } from "@/src/components/PlannerTable";

export default async function PlannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pursuit = await getPursuit(id);
  if (!pursuit) notFound();
  const items = await listActionItems(id);
  return <PlannerTable pursuitId={id} items={items} />;
}
