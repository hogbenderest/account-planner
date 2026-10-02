-- Account Planner schema
CREATE TABLE IF NOT EXISTS pursuits (
  id TEXT PRIMARY KEY,
  owner_email TEXT NOT NULL,
  account_name TEXT NOT NULL DEFAULT '',
  parent_account TEXT NOT NULL DEFAULT '',
  lead_salesperson TEXT NOT NULL DEFAULT '',
  salesperson_email TEXT NOT NULL DEFAULT '',
  team_members TEXT NOT NULL DEFAULT '',
  phase TEXT NOT NULL DEFAULT '',
  proposed_offering TEXT NOT NULL DEFAULT '',
  deal_size INTEGER,
  close_date TEXT,
  analysis_date_current TEXT,
  analysis_date_last TEXT,
  analysis_date_prior TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pursuits_owner ON pursuits(owner_email);

-- Qualifier: 3 dated snapshots per pursuit. slot 1 = current, 2 = prior, 3 = prior-prior.
-- Scores arrays are JSON: [number|null x7]. Evidence arrays are JSON: [string x7].
CREATE TABLE IF NOT EXISTS qual_snapshots (
  id TEXT PRIMARY KEY,
  pursuit_id TEXT NOT NULL REFERENCES pursuits(id) ON DELETE CASCADE,
  slot INTEGER NOT NULL CHECK (slot IN (1, 2, 3)),
  analysis_date TEXT,
  should_scores TEXT NOT NULL DEFAULT '[]',
  should_evidence TEXT NOT NULL DEFAULT '[]',
  can_scores TEXT NOT NULL DEFAULT '[]',
  can_evidence TEXT NOT NULL DEFAULT '[]'
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_qual_slot ON qual_snapshots(pursuit_id, slot);

-- Profiler: 3 dated snapshots per pursuit. Scores JSON: [number|null x24].
CREATE TABLE IF NOT EXISTS profiler_snapshots (
  id TEXT PRIMARY KEY,
  pursuit_id TEXT NOT NULL REFERENCES pursuits(id) ON DELETE CASCADE,
  slot INTEGER NOT NULL CHECK (slot IN (1, 2, 3)),
  analysis_date TEXT,
  scores TEXT NOT NULL DEFAULT '[]',
  evidence TEXT NOT NULL DEFAULT '[]'
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_prof_slot ON profiler_snapshots(pursuit_id, slot);

-- One row per vulnerability category (1..6), created with the pursuit.
CREATE TABLE IF NOT EXISTS vulnerability_actions (
  pursuit_id TEXT NOT NULL REFERENCES pursuits(id) ON DELETE CASCADE,
  category INTEGER NOT NULL CHECK (category BETWEEN 1 AND 6),
  current_state TEXT NOT NULL DEFAULT '',
  desired_state TEXT NOT NULL DEFAULT '',
  agreed_actions TEXT NOT NULL DEFAULT '',
  owner TEXT NOT NULL DEFAULT '',
  target_date TEXT,
  status TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (pursuit_id, category)
);

-- Action Planner rows.
CREATE TABLE IF NOT EXISTS action_items (
  id TEXT PRIMARY KEY,
  pursuit_id TEXT NOT NULL REFERENCES pursuits(id) ON DELETE CASCADE,
  action TEXT NOT NULL DEFAULT '',
  client_contact TEXT NOT NULL DEFAULT '',
  due_date TEXT,
  owner TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_action_items_pursuit ON action_items(pursuit_id, sort_order);
