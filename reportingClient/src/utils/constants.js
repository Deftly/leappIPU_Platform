export const REFRESH_TIME_MS = 20 * 60 * 1000;
export const MAX_TABLE_DATA_LENGTH = 24;
export const FILTER_TEXT_LENGTH = 24;
export const DOCS_PER_PAGE = 8;

export const ES_UPGRADE_INDEX = "/rhel_upgrade_reporting/_search";
export const ES_REPORT_INDEX = "/rhel-reports-summary/_search";

export const VALID_WORKFLOW_TYPES = [
  "inhibitor_check_7_to_8", "inhibitor_check_8_to_9",
  "operational_check_7_to_8",
  "operational_check_7_to_9",
  "operational_check_8_to_9",
  "upgrade_7_to_8",
  "upgrade_7_to_9",
  "upgrade_8_to_9",
];

export const towerBaseUrl = {
  amrs: "https://asl-tower.bankofamerica.com",
  apac: "https://asl-tower-apac.bankofamerica.com",
  emea: "https://asl-tower-emea.bankofamerica.com",
  dmz: "https://asl-towerb2d.bankofamerica.com",
};

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
