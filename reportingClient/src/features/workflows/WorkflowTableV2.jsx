import { useNavigate } from "react-router-dom";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale-subtle.css";
import { toast } from "react-hot-toast";

import { MAX_TABLE_DATA_LENGTH } from "../../utils/constants";

import Button from "../../ui/Button";
import Spinner from "../../ui/Spinner";
import StatusBadge from "../../ui/StatusBadge";

const WorkflowTableV2 = ({ workflows = [], isLoading }) => {
  const navigate = useNavigate();

  const tableHeaders = [
    { key: "started", label: "Started" },
    { key: "finished", label: "Finished" },
    { key: "limit", label: "Hostname" },
    { key: "region", label: "Region" },
    { key: "workflowType", label: "Workflow" },
    { key: "failed", label: "Status" },
    { key: "release", label: "Release" },
  ];

  const truncateData = (data) => {
    if (data.length > MAX_TABLE_DATA_LENGTH) {
      return data.substring(0, MAX_TABLE_DATA_LENGTH) + "...";
    }
    return data;
  };

  const handleDataClick = (cellData) => {
    navigator.clipboard.writeText(cellData);
    toast.success("Data copied to clipboard!");
  };

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
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={tableHeaders.length + 1}
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center"
                      >
                        <Spinner />
                      </td>
                    </tr>
                  ) : workflows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={tableHeaders.length + 1}
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
                          if (key === "failed") {
                            return (
                              <td
                                key={key}
                                className="whitespace-nowrap px-3 py-4 text-sm text-gray-700"
                              >
                                <StatusBadge
                                  failed={workflow.failed}
                                  timedOut={workflow.jobs.some(
                                    (job) => job.timed_out,
                                  )}
                                />
                              </td>
                            );
                          }
                          const isTruncated =
                            cellData && cellData.length > MAX_TABLE_DATA_LENGTH;

                          return (
                            <td
                              key={key}
                              className="whitespace-nowrap px-3 py-4 text-sm text-gray-700"
                            >
                              <div
                                onClick={() => handleDataClick(cellData)}
                                className="cursor-pointer"
                              >
                                {isTruncated ? (
                                  <Tippy
                                    content={cellData}
                                    theme="custom-tooltip"
                                    animation="scale-subtle"
                                    interactive
                                    duration={[null, 0]}
                                  >
                                    <span>{truncateData(cellData)}</span>
                                  </Tippy>
                                ) : (
                                  cellData
                                )}
                              </div>
                            </td>
                          );
                        })}
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Button
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/workflows/${workflow.limit}/${workflow.txId}/stages`,
                                {
                                  state: { workflowData: workflow },
                                },
                              )
                            }
                          >
                            Stages
                          </Button>
                        </td>
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

export default WorkflowTableV2;
