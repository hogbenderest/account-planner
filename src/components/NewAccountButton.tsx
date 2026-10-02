"use client";

import { useRef, useTransition } from "react";
import { createPursuitAction } from "@/app/actions";

export function NewAccountButton() {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        className="rounded-md bg-cf-orange px-4 py-2 text-sm font-semibold text-white hover:bg-cf-orange-dark"
        onClick={() => formRef.current?.showModal()}
      >
        New account
      </button>
      <dialog ref={formRef} className="w-full max-w-md rounded-xl bg-white p-6 backdrop:bg-cf-navy/60" onClick={(e) => e.target === formRef.current && formRef.current.close()}>
        <h2 className="text-lg font-semibold text-cf-ink">New account</h2>
        <p className="mt-1 text-sm text-cf-muted">Create a pursuit for a customer account. You can fill in the rest on the next screen.</p>
        <form
          className="mt-4 flex flex-col gap-3"
          action={(fd) => startTransition(async () => void (await createPursuitAction(fd)))}
        >
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-cf-ink">Account name</span>
            <input name="accountName" required autoFocus className="rounded-md border border-cf-border px-2.5 py-2 text-sm focus:border-cf-orange focus:outline-none" placeholder="e.g. ACME Corp" />
          </label>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md border border-cf-border px-4 py-2 text-sm font-medium text-cf-ink hover:bg-cf-canvas"
              onClick={() => formRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-cf-orange px-4 py-2 text-sm font-semibold text-white hover:bg-cf-orange-dark disabled:opacity-60"
            >
              {pending ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
