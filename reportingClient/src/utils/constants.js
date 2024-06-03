export const REFRESH_TIME_MS = 20 * 60 * 1000;
export const MAX_TABLE_DATA_LENGTH = 24;
export const FILTER_TEXT_LENGTH = 24;
export const DOCS_PER_PAGE = 8;

export const ES_UPGRADE_INDEX = "/rhel_upgrade_reporting/_search";

export const WORKFLOW_FIELDS = [
  "limit",
  "started",
  "finished",
  "release",
  "failed",
  "automation_failure",
  "workflow_type",
  "id",
  "failed_validation",
  "region",
  "jobs.id",
  "jobs.failed",
  "jobs.status",
  "jobs.timed_out",
  "jobs.started",
  "jobs.finished",
  "jobs.name",
  "jobs.extra_vars.major_workflow",
  "jobs.extra_vars.sub_workflow",
  "jobs.extra_vars.changefile_included_role",
  "jobs.extra_vars.txId",
  "jobs.extra_vars.backup_taskfile",
  "jobs.extra_vars.changefile_tasks_from",
  "jobs.extra_vars.current_rhel_version",
  "jobs.extra_vars.final_rhel_major_version",
  "jobs.failed_tasks.task",
  "jobs.failed_tasks.id",
  "jobs.failed_tasks.stdout",
  "jobs.failed_tasks.role",
  "jobs.failed_tasks.event_data.start",
  "jobs.failed_tasks.event_data.end",
];
