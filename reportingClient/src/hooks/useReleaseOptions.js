import { useQuery } from "@tanstack/react-query";
import { queryElasticsearch } from "../api/queryElastic";

import { ES_UPGRADE_INDEX } from "../utils/constants";

const useReleaseOptions = () => {
  const { data, isLoading, error } = useQuery(
    ["releaseOptions"],
    async () => {
      const response = await queryElasticsearch({
        endpoint: ES_UPGRADE_INDEX,
        method: "POST",
        body: {
          aggs: {
            regions: {
              terms: {
                field: "release.keyword",
                size: 10000, // Adjust the size as needed
              },
            },
          },
          size: 0,
        },
      });

      const releases = response.aggregations.regions.buckets.map(
        (bucket) => bucket.key,
      );

      return releases;
    },
    {
      staleTime: Infinity, // Adjust the cache behavior as needed
    },
  );

  return { releases: data, isLoading, error };
};

export default useReleaseOptions;
