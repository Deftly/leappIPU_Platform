export function buildWorkflowsQuery(
  // TODO: Change this to be desctructured from an object so order doesn't matter
  searchQuery = "",
  startDate = null,
  endDate = null,
  regions = null,
  workflowTypes = null,
  failed = null,
  releaseVersions = null,
) {
  const query = {
    bool: {
      must: [],
    },
  };

  if (searchQuery) {
    const limits = searchQuery
      .toLowerCase()
      .trim()
      .split(/[\s,]+/);
    query.bool.must.push({
      bool: {
        should: limits.flatMap((limit) => [
          {
            match: {
              limit: {
                query: limit,
                operator: "and",
              },
            },
          },
          {
            wildcard: {
              limit: {
                value: `*${limit}*`,
                case_insensitive: true,
              },
            },
          },
        ]),
        minimum_should_match: 1,
      },
    });
  }

  if (startDate && endDate) {
    query.bool.must.push({
      range: {
        started: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
      },
    });
  }

  if (regions && regions.length > 0) {
    query.bool.must.push({
      terms: {
        region: regions,
      },
    });
  }

  if (workflowTypes && workflowTypes.length > 0) {
    query.bool.must.push({
      terms: {
        workflow_type: workflowTypes,
      },
    });
  }

  if (failed !== null) {
    query.bool.must.push({
      term: {
        failed: failed,
      },
    });
  }

  if (releaseVersions) {
    query.bool.must.push({
      match: {
        release: releaseVersions,
      },
    });
  }

  return query;
}
