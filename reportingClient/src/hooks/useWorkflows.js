import { useQuery } from "@tanstack/react-query";
import { buildWorkflowsQuery } from "../utils/queryBuilder";
import { queryElasticsearch } from "../api/queryElastic";
import {
  DOCS_PER_PAGE,
  REFRESH_TIME_MS,
  WORKFLOW_FIELDS,
  ES_UPGRADE_INDEX,
} from "../utils/constants";
import { mapWorkflowData } from "../utils/helpers";

export function useElasticsearchWorkflows({
  searchAfter = null,
  searchQuery = "",
  startDate = null,
  endDate = null,
  regions = null,
  workflowTypes = null,
  failed = null,
  releaseVersions = null,
} = {}) {
  const { isLoading, data, error } = useQuery({
    queryKey: [
      "elasticsearchWorkflows",
      searchAfter,
      searchQuery,
      startDate,
      endDate,
      regions,
      workflowTypes,
      failed,
      releaseVersions,
    ],
    queryFn: async () => {
      const size = DOCS_PER_PAGE;
      const query = buildWorkflowsQuery({
        searchQuery,
        startDate,
        endDate,
        regions,
        workflowTypes,
        failed,
        releaseVersions,
      });

      const response = await queryElasticsearch({
        endpoint: ES_UPGRADE_INDEX,
        method: "POST",
        body: {
          query,
          sort: [
            { started: { order: "desc" } },
            { _id: { order: "desc" } }, // Add this secondary sort
          ],
          size,
          _source: WORKFLOW_FIELDS,
          ...(searchAfter && { search_after: searchAfter }),
        },
      });

      const workflows = response.hits.hits.map(mapWorkflowData);
      const totalHits = response.hits.total.value;
      const lastSort =
        response.hits.hits.length > 0
          ? response.hits.hits[response.hits.hits.length - 1].sort
          : null;

      return {
        workflows,
        totalHits,
        lastSort,
      };
    },
    keepPreviousData: true,
    staleTime: REFRESH_TIME_MS,
    refetchOnMount: true,
  });

  return { isLoading, data, error };
}
