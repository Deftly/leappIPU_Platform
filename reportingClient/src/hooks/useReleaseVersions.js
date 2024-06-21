import { useQuery } from "@tanstack/react-query";
import { queryElasticsearch } from "../api/queryElastic";
import { ES_UPGRADE_INDEX } from "../utils/constants";

const useReleaseVersions = () => {
  const { data, isLoading, error } = useQuery(
    ["releaseVersions"],
    async () => {
      const response = await queryElasticsearch({
        endpoint: ES_UPGRADE_INDEX,
        method: "POST",
        body: {
          aggs: {
            releases: {
              terms: {
                field: "release.keyword",
                size: 1000, // Adjust as needed
              },
            },
          },
          size: 0,
        },
      });

      const releases = response.aggregations.releases.buckets.map(
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

export default useReleaseVersions;
