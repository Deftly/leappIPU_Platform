import { useLocation, useParams } from "react-router-dom";
import { useElasticSearchStages } from "../hooks/useStages";

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

  console.log("fields:", fields);

  const failedTasks = dataToUse.jobs.flatMap((job) => job.failedTasks || []);

  console.log("failedTasks:", failedTasks);

  return (
    <div className="border-b border-gray-200 bg-blue-100 rounded-md shadow-sm px-4 py-4 sm:px-6">
      <Heading as="h2">{dataToUse.workflowType}</Heading>
      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map(({ label, value }) => (
          <div key={label} className="sm:col-span-1">
            <div className="flex items-center">
              <dt className="mr-2 flex-shrink-0 text-sm font-semibold ">
                {label}:
              </dt>
              <dd className="text-sm text-gray-900">{value}</dd>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stages;
