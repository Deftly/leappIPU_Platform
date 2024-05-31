export function formatTimestamp(timestamp) {
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
        stdout: failedTask.stdout,
        role: failedTask.role,
        start: failedTask.event_data?.start,
        end: failedTask.event_data?.end,
      })),
    })),
  };
}
