import { useMemo } from "react";
import { useElasticsearchWorkflows } from "../hooks/useWorkflows";

import WorkflowTableV2 from "../features/workflows/WorkflowTableV2";

import Heading from "../ui/Heading";

const Workflows = () => {
  const { isLoading, data } = useElasticsearchWorkflows();

  const workflows = useMemo(() => data?.workflows || [], [data]);

  return (
    <div className="mt-1">
      <div className="flex justify-between items-end mb-8">
        <Heading as="h1">Workflows</Heading>
      </div>
      <WorkflowTableV2 workflows={workflows} isLoading={isLoading} />
    </div>
  );
};

export default Workflows;
