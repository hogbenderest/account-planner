-- Align status values with the source workbook's option set:
-- Not Yet Started / In Progress / Completed / Pending.
-- Renames the legacy v1 spellings so existing rows match the new dropdowns.
UPDATE action_items SET status = 'Not Yet Started' WHERE status = 'Not Started';
UPDATE action_items SET status = 'Completed' WHERE status = 'Complete';
UPDATE action_items SET status = 'In Progress' WHERE status = 'In progress';
UPDATE vulnerability_actions SET status = 'Not Yet Started' WHERE status = 'Not Started';
UPDATE vulnerability_actions SET status = 'Completed' WHERE status = 'Complete';
UPDATE vulnerability_actions SET status = 'In Progress' WHERE status = 'In progress';
