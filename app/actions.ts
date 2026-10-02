"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createActionItem,
  createPursuit,
  deleteActionItem,
  deletePursuit,
  rotateProfiler,
  rotateQual,
  saveProfilerSnapshot,
  saveQualSnapshot,
  saveVulnerabilityAction,
  updateActionItem,
  updatePursuit,
  listActionItems,
  getQualSnapshots,
  getProfilerSnapshots,
} from "@/src/lib/db";

function assertSlot(slot: number) {
  if (slot !== 1) throw new Error("Only the current analysis is editable");
}

export async function createPursuitAction(formData: FormData) {
  const accountName = String(formData.get("accountName") ?? "").trim();
  const id = await createPursuit({ accountName: accountName || "Untitled account" });
  revalidatePath("/");
  redirect(`/pursuit/${id}`);
}

export async function deletePursuitAction(id: string) {
  await deletePursuit(id);
  revalidatePath("/");
  redirect("/");
}

export async function savePursuitAction(
  id: string,
  patch: Record<string, string | number | null>,
) {
  await updatePursuit(id, patch as never);
  revalidatePath(`/pursuit/${id}`);
}

export async function saveQualAction(
  pursuitId: string,
  data: {
    shouldScores: (number | null)[];
    shouldEvidence: string[];
    canScores: (number | null)[];
    canEvidence: string[];
  },
) {
  const existing = await getQualSnapshots(pursuitId);
  const current = existing.find((s) => s.slot === 1);
  if (!current) throw new Error("No current qualifier snapshot");
  assertSlot(1);
  await saveQualSnapshot(pursuitId, 1, {
    analysisDate: current.analysisDate ?? new Date().toISOString().slice(0, 10),
    shouldScores: data.shouldScores,
    shouldEvidence: data.shouldEvidence,
    canScores: data.canScores,
    canEvidence: data.canEvidence,
  });
}

export async function rotateQualAction(pursuitId: string) {
  await rotateQual(pursuitId);
  revalidatePath(`/pursuit/${pursuitId}`);
  revalidatePath(`/pursuit/${pursuitId}/qualifier`);
  revalidatePath(`/pursuit/${pursuitId}/qualifier/matrix`);
}

export async function saveProfilerAction(
  pursuitId: string,
  data: { scores: (number | null)[]; evidence: string[] },
) {
  const existing = await getProfilerSnapshots(pursuitId);
  const current = existing.find((s) => s.slot === 1);
  if (!current) throw new Error("No current profiler snapshot");
  assertSlot(1);
  await saveProfilerSnapshot(pursuitId, 1, {
    analysisDate: current.analysisDate ?? new Date().toISOString().slice(0, 10),
    scores: data.scores,
    evidence: data.evidence,
  });
}

export async function rotateProfilerAction(pursuitId: string) {
  await rotateProfiler(pursuitId);
  revalidatePath(`/pursuit/${pursuitId}`);
  revalidatePath(`/pursuit/${pursuitId}/profiler`);
  revalidatePath(`/pursuit/${pursuitId}/profiler/blueprint`);
  revalidatePath(`/pursuit/${pursuitId}/tracker`);
}

export async function saveVulnerabilityActionAction(
  pursuitId: string,
  category: number,
  patch: { currentState?: string; desiredState?: string; agreedActions?: string; owner?: string; targetDate?: string | null; status?: string },
) {
  await saveVulnerabilityAction(pursuitId, category, patch);
}

export async function addActionItemAction(pursuitId: string) {
  await createActionItem(pursuitId);
  const items = await listActionItems(pursuitId);
  revalidatePath(`/pursuit/${pursuitId}/planner`);
  return items.length;
}

export async function saveActionItemAction(
  pursuitId: string,
  id: string,
  patch: { action?: string; clientContact?: string; dueDate?: string | null; owner?: string; priority?: string; status?: string },
) {
  await updateActionItem(pursuitId, id, patch);
}

export async function deleteActionItemAction(pursuitId: string, id: string) {
  await deleteActionItem(pursuitId, id);
  revalidatePath(`/pursuit/${pursuitId}/planner`);
}
