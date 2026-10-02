"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "saved" | "saving" | "dirty" | "error";

/**
 * Local state + debounced persistence. The data stays authoritative in the
 * client while editing; the server save trails by `delayMs`.
 */
export function useAutosave<T>(
  save: (data: T) => Promise<void>,
  initialData: T,
  delayMs = 400,
  onSaved?: () => void,
) {
  const [data, setData] = useState<T>(initialData);
  const [status, setStatus] = useState<SaveStatus>("saved");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(initialData);
  const saveRef = useRef(save);
  saveRef.current = save;
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  useEffect(() => {
    latest.current = data;
  }, [data]);

  const flush = useCallback(async () => {
    setStatus("saving");
    try {
      await saveRef.current(latest.current);
      setStatus("saved");
      onSavedRef.current?.();
    } catch {
      setStatus("error");
    }
  }, []);

  const update = useCallback(
    (updater: (prev: T) => T) => {
      setData((prev) => updater(prev));
      setStatus("dirty");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), delayMs);
    },
    [delayMs, flush],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { data, update, status, setData };
}
