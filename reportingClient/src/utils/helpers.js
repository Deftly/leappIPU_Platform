export function formatTimestamp(timestamp) {
  if (!timestamp) return undefined;

  const utcTimestamp = timestamp.replace("Z", "");

  const date = new Date(utcTimestamp);

  const dateTimeOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  };

  // Format the date and time according to the user's locale and timezone
  const formattedDateTime = date.toLocaleString("en-US", dateTimeOptions);

  return formattedDateTime;
}

export function nameFormatter(string) {
  return string
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function classifyJob(job) {
  if (!job.extraVars) {
    return "Unknown";
  }

  const {
    subWorkflow,
    backup_taskfile,
    changefile_included_role,
    changefile_tasks_from,
  } = job.extraVars;

  const operationalCheckMap = {
    operational_check_7_to_9: "operational check 7 to 9",
    operational_check_7_to_8: "operational check 7 to 8",
    upgrade_7_to_8: "operational check 7 to 8",
    inhibitor_check_7_to_8: "operational check 7 to 8",
    upgrade_8_to_9: "operational check 8 to 9",
    inhibitor_check_8_to_9: "operational check 8 to 9",
    operational_check_8_to_9: "operational check 8 to 9", // Add this line
  };

  if (operationalCheckMap[subWorkflow]) {
    if (
      job.name &&
      (job.name.includes("operational_check") ||
        job.name.includes("leapp_operational_check"))
    ) {
      return operationalCheckMap[subWorkflow];
    }
  }

  const roleMap = {
    mitigation_7_to_8: "mitigation 7 to 8",
    mitigation_8_to_9: "mitigation 8 to 9",
    inhibitor_check_7_to_8: "inhibitor check 7 to 8",
    inhibitor_check_8_to_9: "inhibitor check 8 to 9",
    upgrade_7_to_8: "upgrade 7 to 8",
    upgrade_8_to_9: "upgrade 8 to 9",
    postupgrade_7_to_8: "postupgrade 7 to 8",
    postupgrade_8_to_9: "postupgrade 8 to 9",
  };

  if (job.name && job.name.includes("rear_distribution")) {
    if (
      backup_taskfile === "rear_backup" ||
      backup_taskfile === "lvm_snapshot_create"
    ) {
      return backup_taskfile;
    }
  }

  if (job.name && job.name.includes("upgrade_distribution")) {
    if (roleMap[changefile_included_role]) {
      return roleMap[changefile_included_role];
    }
    if (
      changefile_included_role === "changefile" &&
      changefile_tasks_from === "rollback"
    ) {
      return "rollback";
    }
  }

  return subWorkflow === "vastool_breadcrumb" ||
    subWorkflow === "vastool_revert"
    ? subWorkflow
    : "Unknown";
}

export function mapWorkflowData(hit) {
  const txId = hit._source.jobs[0]?.extra_vars?.txId;

  // NOTE: Not a permanent solution, this should be handled in the processing layer
  // applied to dmz jobs, need to pull second to last item rather than last item
  let release = hit._source.release;
  if (typeof release === "string") {
    const match = hit._source.jobs[0]?.name.match(/\d+\.\d+\.\d+/);
    if (match) {
      release = match[0];
    }
  }

  return {
    id: hit._id,
    limit: hit._source.limit,
    started: formatTimestamp(hit._source.started),
    finished: formatTimestamp(hit._source.finished),
    release: release, // Use the extracted release value
    failed: hit._source.failed,
    automation_failure: hit._source.automation_failure,
    workflowType: nameFormatter(hit._source.workflow_type),
    failedValidation: hit._source.failed_validation,
    region: hit._source.region,
    txId: txId,
    jobs: hit._source.jobs.map((job) => ({
      id: job.id,
      failed: job.failed,
      status: job.status,
      timed_out: job.timed_out,
      started: formatTimestamp(job.started),
      finished: formatTimestamp(job.finished),
      name: job.name,
      extraVars: {
        majorWorkflow: job.extra_vars.major_workflow,
        subWorkflow: job.extra_vars.sub_workflow,
        changefile_included_role: job.extra_vars.changefile_included_role,
        backup_taskfile: job.extra_vars.backup_taskfile,
        changefile_tasks_from: job.extra_vars.changefile_tasks_from,
        current_rhel_version: job.extra_vars.current_rhel_version,
        final_rhel_major_version: job.extra_vars.final_rhel_major_version,
      },
      failedTasks: job.failed_tasks?.map((failedTask) => ({
        task: failedTask.task,
        id: failedTask.id,
        stdout: failedTask.stdout
          .replace(new RegExp(`^.*?(?=\\[${hit._source.limit}\\])`), "")
          .replace(/\[0m$/, ""),
        role: failedTask.role,
        start: failedTask.event_data?.start
          ? formatTimestamp(failedTask.event_data.start)
          : undefined,
        end: failedTask.event_data?.end
          ? formatTimestamp(failedTask.event_data.end)
          : undefined,
      })),
    })),
  };
}
