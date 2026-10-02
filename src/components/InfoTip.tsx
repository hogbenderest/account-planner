"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Accessible field tooltip. A focusable button toggles a popover that
 * renders in a portal attached to the document body, so it can never be
 * clipped by table scroll containers or hidden behind overflow parents.
 * Hover opens it on pointer devices; click, Enter and Space work for
 * keyboard and touch. Escape and outside interaction close it.
 */
export function InfoTip({ tip, label }: { tip: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => setMounted(true), []);

  const reposition = useCallback(() => {
    const btn = btnRef.current;
    const pop = popRef.current;
    if (!btn || !pop) return;
    const r = btn.getBoundingClientRect();
    const POP_W = 288;
    const GAP = 8;
    let left = r.left;
    left = Math.min(left, window.innerWidth - POP_W - GAP);
    left = Math.max(GAP, left);
    pop.style.left = `${left}px`;
    pop.style.top = `${r.bottom + GAP}px`;
    pop.style.maxWidth = `${POP_W}px`;
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label ? `About ${label}` : "More information"}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        onFocus={(e) => {
          if (e.target.matches(":focus-visible")) setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full border border-cf-muted/50 text-[10px] font-bold leading-none text-cf-muted align-middle hover:border-cf-orange hover:text-cf-orange"
      >
        ?
      </button>
      {mounted && open && (
        <div
          id={id}
          ref={popRef}
          role="tooltip"
          className="pointer-events-none fixed z-[80] rounded-lg border border-cf-border bg-white px-3 py-2 text-xs leading-5 font-normal text-cf-ink shadow-xl"
          style={{ left: -9999, top: -9999 }}
        >
          {tip}
        </div>
      )}
    </>
  );
}
