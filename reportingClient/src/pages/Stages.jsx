import { useLocation, useParams } from "react-router-dom";
import { useElasticSearchStages } from "../hooks/useStages";

import StagesTable from "../features/stages/StagesTable";
import FailedTaskCard from "../features/stages/FailedTaskCard";

import Heading from "../ui/Heading";
import Spinner from "../ui/Spinner";
import StatusBadge from "../ui/StatusBadge";

const Stages = () => {
  const location = useLocation();
  const { workflowData } = location.state || {};
  const { hostname, txId } = useParams();
  const { isLoading, data } = useElasticSearchStages(hostname, txId);

  const dataFromState = !!workflowData;
  const source = dataFromState ? [workflowData] : data;

  if (isLoading && !dataFromState) {
    return <Spinner />;
  }

  const dataToUse = source[0];

  const tableHeaders = [
    { key: "name", label: "Job Name" },
    { key: "started", label: "Start Time" },
    { key: "finished", label: "End Time" },
    { key: "id", label: "Job ID" },
    { key: "status", label: "Status" },
  ];

  const fields = [
    {
      label: "Hostname",
      value: dataToUse.limit.split(
        /\.sdi\.corp\.bankofamerica\.com|\.bankofamerica\.com/,
      )[0],
    },
    { label: "Start Time", value: dataToUse.started },
    { label: "End Time", value: dataToUse.finished },
    {
      label: "Overall Status",
      value: <StatusBadge failed={dataToUse.failed} />,
    },
    { label: "Release", value: dataToUse.release },
    { label: "Region", value: dataToUse.region },
  ];

  const failedTasks = dataToUse.jobs.flatMap((job) => job.failedTasks || []);

  console.log("failedTasks:", failedTasks);

  return (
    <div>
      <div className="border border-gray-200 bg-blue-100 rounded-md shadow-md px-4 py-4 sm:px-6">
        <div className="flex items-center mb-8">
          <Heading as="h2" className="mr-6">
            {dataToUse.workflowType}
          </Heading>
          {dataToUse.failedValidation && (
            <StatusBadge failedValidation={true} />
          )}
        </div>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map(({ label, value }) => (
            <div key={label} className="sm:col-span-1">
              <div className="flex items-center">
                <dt className="mr-2 flex-shrink-0 text-sm font-semibold">
                  {label}:
                </dt>
                <dd className="text-sm text-gray-900">{value}</dd>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-10">
        <StagesTable
          jobs={dataToUse.jobs}
          isLoading={isLoading && !dataFromState}
          tableHeaders={tableHeaders}
          region={dataToUse.region}
        />
      </div>
      {failedTasks.length > 0 && (
        <div className="mt-10">
          <Heading as="h3">Failed Tasks</Heading>
          <FailedTaskCard tasks={failedTasks} />
        </div>
      )}
    </div>
  );
};

export default Stages;
