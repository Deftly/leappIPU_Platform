import { useQuery } from "@tanstack/react-query";
import { buildWorkflowsQuery } from "../utils/queryBuilder";
import { queryElasticsearch } from "../api/queryElastic";
import {
  DOCS_PER_PAGE,
  REFRESH_TIME_MS,
  WORKFLOW_FIELDS,
} from "../utils/constants";
import { mapWorkflowData } from "../utils/helpers";

export function useElasticsearchWorkflows(
  pageParam = 0,
  searchQuery = "",
  startDate = null,
  endDate = null,
  regions = null,
  workflowTypes = null,
  failed = null,
  releaseVersions = null,
) {
  const { isLoading, data, error } = useQuery({
    queryKey: [
      "elasticsearchWorkflows",
      pageParam,
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
      const query = buildWorkflowsQuery(
        searchQuery,
        startDate,
        endDate,
        regions,
        workflowTypes,
        failed,
        releaseVersions,
      );

      const response = await queryElasticsearch({
        endpoint: "/rhel_upgrade_reporting/_search",
        method: "POST",
        body: {
          query,
          sort: [
            {
              started: {
                order: "desc",
              },
            },
          ],
          from: pageParam * DOCS_PER_PAGE,
          size,
          _source: WORKFLOW_FIELDS,
        },
      });

      const workflows = response.hits.hits.map(mapWorkflowData);
      const totalHits = response.hits.hits.value;

      return {
        workflows,
        totalHits,
      };
    },
    keepPreviousData: true,
    staleTime: REFRESH_TIME_MS,
    refetchOnMount: true,
  });

  return { isLoading, data, error };
}
