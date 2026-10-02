"use client";

import type { SaveStatus } from "./useAutosave";

export function SavedIndicator({ status }: { status: SaveStatus }) {
  if (status === "saved") {
    return <span className="text-xs text-cf-muted">Saved</span>;
  }
  if (status === "saving") {
    return <span className="text-xs text-cf-muted">Saving…</span>;
  }
  if (status === "dirty") {
    return <span className="text-xs text-cf-orange">Unsaved changes</span>;
  }
  return <span className="text-xs text-light-red">Save failed - retry by editing again</span>;
}
