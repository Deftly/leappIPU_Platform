import { useQuery } from "@tanstack/react-query";
import { queryElasticsearch } from "../api/queryElastic";

const useRegionOptions = () => {
  const { data, isLoading, error } = useQuery(
    ["regionOptions"],
    async () => {
      const response = await queryElasticsearch({
        endpoint: "/rhel_upgrade_reporting/_search",
        method: "POST",
        body: {
          aggs: {
            regions: {
              terms: {
                field: "region.keyword",
                size: 10000, // Adjust the size as needed
              },
            },
          },
          size: 0,
        },
      });

      const regions = response.aggregations.regions.buckets.map(
        (bucket) => bucket.key,
      );

      return regions;
    },
    {
      staleTime: Infinity, // Adjust the cache behavior as needed
    },
  );

  return { regions: data, isLoading, error };
};

export default useRegionOptions;
