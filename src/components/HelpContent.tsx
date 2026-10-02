import { ATTRIBUTION } from "@/src/lib/workbook-config";

/**
 * Help content shared by the standalone /help page and the pursuit-scoped
 * /pursuit/[id]/help page (which renders inside the sidebar layout).
 */
export function HelpContent() {
  return (
    <div className="text-sm leading-6 text-cf-ink">
      <h1 className="text-xl font-bold">How Account Planner works</h1>

      <p className="mt-3">
        Account Planner helps you qualify opportunities and assess your competitive advantage on a per-account basis.
        It has two analytical tools, each with a graphical companion, plus a tracker and a planner for next steps.
      </p>

      <h2 className="mt-8 text-base font-semibold">Opportunity Qualification (first gate)</h2>
      <p className="mt-2">
        Seven <strong>Should We Sell</strong> criteria and seven <strong>Can We Sell</strong> criteria, each scored
        against its own range. Use it early in the sales cycle, before investing pursuit resources. Totals land in one
        of three bands - Undesirable, Acceptable, or Premium business (Should); High, Medium, or Low difficulty (Can).
      </p>
      <p className="mt-2">
        The <strong>Qualification Matrix</strong> plots your recorded evaluations on one chart: right means easier
        to win, up means better business. Watch the point move as your position improves.
      </p>

      <h2 className="mt-8 text-base font-semibold">Competitive Advantage Profile (second gate)</h2>
      <p className="mt-2">
        Once qualified and in pursuit, score 24 criteria across the six most common sales vulnerabilities:
        Competitive Strategy, Decision Making Process, Relational Superiority, Political Alignment, Value Proposition,
        and Pursuit Momentum. Score it regularly through the pursuit.
      </p>
      <p className="mt-2">
        The <strong>Advantage Blueprint</strong> shows your recorded evaluations as an overlay on the six axes,
        with the <strong>Pursuit Score</strong> at the centre. Keep building advantage until the Pursuit Score is
        80% or above.
      </p>

      <h2 className="mt-8 text-base font-semibold">Evaluations and history</h2>
      <p className="mt-2">
        Each tool keeps your last three evaluations. Press <strong>New analysis</strong> to start a fresh one dated
        today: the current evaluation becomes the prior one, and the oldest is discarded. An analysis with no
        answers yet is not recorded and is never shown as a zero evaluation. Everything saves automatically as you
        type.
      </p>

      <h2 className="mt-8 text-base font-semibold">Pursuit Tracker and Action Planner</h2>
      <p className="mt-2">
        The <strong>Pursuit Tracker</strong> compares your prior and current profile scores for each vulnerability
        and records the current state, desired state, agreed actions, owner, target date, and status for each.
        The <strong>Action Planner</strong> is a simple list of tactical next steps: what, why and how; with whom;
        when; and who owns it.
      </p>

      <h2 className="mt-8 text-base font-semibold">Access and privacy</h2>
      <p className="mt-2">
        You sign in with your email address and a one-time PIN. Every account you create is yours alone; other users
        see only their own accounts.
      </p>

      <p className="mt-10 border-t border-cf-border pt-4 text-xs text-cf-muted">{ATTRIBUTION}</p>
    </div>
  );
}
