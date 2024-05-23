import WorkflowTableV2 from "../features/workflows/WorkflowTableV2";

import Heading from "../ui/Heading";

const Workflows = () => {
  return (
    <div className="mt-1">
      <div className="flex justify-between items-end mb-8">
        <Heading as="h1">Workflows</Heading>
      </div>
      <WorkflowTableV2 />
    </div>
  );
};

export default Workflows;
