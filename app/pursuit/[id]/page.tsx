import { notFound } from "next/navigation";
import { getPursuit } from "@/src/lib/db";
import { PursuitForm } from "@/src/components/PursuitForm";

export default async function AccountInformationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pursuit = await getPursuit(id);
  if (!pursuit) notFound();
  return <PursuitForm pursuit={pursuit} />;
}
