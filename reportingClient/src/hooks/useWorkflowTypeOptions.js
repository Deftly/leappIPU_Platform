import { useQuery } from "@tanstack/react-query";
import { queryElasticsearch } from "../api/queryElastic";

import { ES_UPGRADE_INDEX } from "../utils/constants";

const useWorkflowTypeOptions = () => {
  const { data, isLoading, error } = useQuery(
    ["workflowTypeOptions"],
    async () => {
      const response = await queryElasticsearch({
        endpoint: ES_UPGRADE_INDEX,
        method: "POST",
        body: {
          aggs: {
            workflow_types: {
              terms: {
                field: "workflow_type.keyword",
                size: 10000, // Adjust the size as needed
              },
            },
          },
          size: 0,
        },
      });

      const workflowTypes = response.aggregations.workflow_types.buckets.map(
        (bucket) => bucket.key,
      );

      // Sort the workflowTypes array in alphabetical order
      const sortedWorkflowTypes = workflowTypes.sort((a, b) =>
        a.localeCompare(b),
      );

      return sortedWorkflowTypes;
    },
    {
      staleTime: Infinity, // Adjust the cache behavior as needed
    },
  );

  return { workflowTypes: data, isLoading, error };
};

export default useWorkflowTypeOptions;
