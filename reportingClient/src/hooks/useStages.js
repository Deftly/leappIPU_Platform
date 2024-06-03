import { useQuery } from "@tanstack/react-query";

import { ES_UPGRADE_INDEX, WORKFLOW_FIELDS } from "../utils/constants";
import { queryElasticsearch } from "../api/queryElastic";
import { mapWorkflowData } from "../utils/helpers";

export function useElasticSearchStages(limit, txId) {
  const { isLoading, data, error } = useQuery({
    queryKey: ["elasticsearchStages", limit, txId],
    queryFn: async () => {
      const response = await queryElasticsearch({
        endpoint: ES_UPGRADE_INDEX,
        method: "POST",
        body: {
          query: {
            bool: {
              must: [
                {
                  match: {
                    limit: limit,
                  },
                },
                {
                  nested: {
                    path: "jobs",
                    query: {
                      match: {
                        "jobs.extra_vars.txId": txId,
                      },
                    },
                  },
                },
              ],
            },
          },
          _source: WORKFLOW_FIELDS,
        },
      });

      const workflows = response.hits.hits.map(mapWorkflowData);
      return workflows;
    },
    staleTime: Infinity,
  });

  return { isLoading, data, error };
}
