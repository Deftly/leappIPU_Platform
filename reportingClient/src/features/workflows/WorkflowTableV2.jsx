import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale-subtle.css";
import { toast } from "react-hot-toast";

import { MAX_TABLE_DATA_LENGTH } from "../../utils/constants";

import Button from "../../ui/Button";

const WorkflowTableV2 = ({ workflows }) => {
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
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          {/* <p className="mt-2 text-lg text-gray-700"> */}
          {/*   Workflow data starting from Jan. 31st, 2024 */}
          {/* </p> */}
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Add user
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
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
                  {workflows.map((workflow) => (
                    <tr key={workflow.id}>
                      {tableHeaders.map(({ key }) => {
                        let cellData = workflow[key];
                        if (key === "failed") {
                          cellData = workflow.failed ? "Failed" : "Successful";
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
                        <Button size="sm">Stages</Button>
                      </td>
                    </tr>
                  ))}
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
