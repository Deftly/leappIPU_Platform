import { towerBaseUrl } from "../../utils/constants";
import { nameFormatter, classifyJob } from "../../utils/helpers";

import Spinner from "../../ui/Spinner";
import StatusBadge from "../../ui/StatusBadge";

const getAAPTowerUrl = (region, jobId) => {
  const baseUrl = towerBaseUrl[region];

  return `${baseUrl}/#/jobs/playbook/${jobId}/output`;
};

const StagesTable = ({ workflows = [], isLoading, tableHeaders, region }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-0">
      <div className="mt-2 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    {tableHeaders.map(({ key, label }) => (
                      <th
                        key={key}
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={tableHeaders.length}
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center"
                      >
                        <Spinner />
                      </td>
                    </tr>
                  ) : workflows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={tableHeaders.length}
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center"
                      >
                        No Workflows Found
                      </td>
                    </tr>
                  ) : (
                    workflows.map((workflow) => (
                      <tr key={workflow.id}>
                        {tableHeaders.map(({ key }) => {
                          let cellData = workflow[key];
                          if (key === "status") {
                            return (
                              <td
                                key={key}
                                className="whitespace-nowrap px-3 py-4 text-sm text-gray-700"
                              >
                                <StatusBadge
                                  failed={workflow.failed}
                                  timedOut={workflow.timed_out}
                                />
                              </td>
                            );
                          }
                          if (key === "name") {
                            cellData = nameFormatter(classifyJob(workflow));
                          }
                          if (key === "id") {
                            return (
                              <td
                                key={key}
                                className="whitespace-nowrap px-3 py-4 text-sm text-gray-700"
                              >
                                <a
                                  href={getAAPTowerUrl(region, workflow[key])}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  {workflow[key]}
                                </a>
                              </td>
                            );
                          }
                          return (
                            <td
                              key={key}
                              className="whitespace-nowrap px-3 py-4 text-sm text-gray-700"
                            >
                              {cellData}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StagesTable;
