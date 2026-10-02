/**
 * Tooltip and dropdown copy for Account Planner.
 * Grounded in the source workbook's own help sheets where available
 * (debranded); AU English; no em dashes (style rule).
 */

export const STATUS_OPTIONS: string[] = ["Not Yet Started", "In Progress", "Completed", "Pending"];

export const PRIORITY_OPTIONS: string[] = ["High", "Medium", "Low"];

export const PHASE_OPTIONS: string[] = ["Creating", "Shaping", "Closing"];

export const TIPS = {
  parentAccount:
    "The customer group this account belongs to (e.g. the HQ or ultimate parent). Leave blank for independent accounts.",
  teamMembers:
    "Colleagues whose input informed this analysis. Their perspectives count in every score you set.",
  phase:
    "The stage this pursuit is at. Creating: actively creating or uncovering the opportunity; requirements and budget not yet agreed. Shaping: shaping the customer's requirements and your competitive position with the client. Closing: proposal submitted or decision imminent. Free text is accepted.",
  proposedOffering:
    "The products or services you are proposing in this pursuit, e.g. 'Network, Carriage'.",
  dealSize: "Estimated total contract value of this opportunity in AUD.",
  closeDate: "The date you estimate the customer will sign or decide.",
  analysisHistory:
    "Dates advance automatically when you start a new analysis in either the Qualification or the Profile tool. They are not editable here.",
  evidence:
    "Record client-observable proof: what the client said or did that supports this score. Not your opinion.",
  qualifierTiming:
    "Use early in the sales process, and again before committing pursuit resources.",
  profilerScale:
    "Score your degree of agreement: Don't Know 0, Strongly Disagree +1, Disagree +2, Agree +4, Strongly Agree +5. If unsure, score lower to stay conservative. Complete all six sections.",
  currentState:
    "A brief update on the most current position: the most important information for your team.",
  desiredState:
    "The position you are striving for in this opportunity. Positions usually change gradually, in stages.",
  agreedActions:
    "Not just What, but Why (if not obvious) and How it should be executed. You can keep several action items per vulnerability.",
  trackerOwner: "Who on your team is responsible for executing this action.",
  targetDate: "By when. Also note if this must happen before another step.",
  trackerStatus: `Track progress: ${STATUS_OPTIONS.join(", ")}. Pending means on hold; it may not be necessary depending on the outcomes of previous steps.`,
  action: "What, Why and How. Describe the action step, the reasons if not obvious, and how it should be executed.",
  clientContact: "Names of client personnel you will execute this action with.",
  dueDate: "By when. Also note if this must happen before another step.",
  plannerOwner: "Who on your team is responsible for executing this action.",
  priority: "High, Medium or Low: to prioritise among many actions.",
  plannerStatus: `Track progress: ${STATUS_OPTIONS.join(", ")}. Pending means on hold; it may not be necessary depending on the outcomes of previous steps.`,
} as const;
