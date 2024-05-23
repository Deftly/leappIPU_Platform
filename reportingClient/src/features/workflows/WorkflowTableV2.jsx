import { useState } from "react";

import { MAX_TABLE_DATA_LENGTH } from "../../utils/constants";

const people = [
  {
    started: "5/3/2024, 5:48:35 PM",
    finished: "5/4/2024, 12:03:54 AM",
    hostname: "lva40besplsh5h.ecomm.devicenp.rpg",
    region: "amrs",
    workflow: "Inhibitor Check 8 To 8",
    status: "Successful",
    release: "1.17.1",
  },
];

const WorkflowTableV2 = () => {
  const [hoveredData, setHoveredData] = useState(null);

  const tableHeaders = [
    { key: "started", label: "Started" },
    { key: "finished", label: "Finished" },
    { key: "hostname", label: "Hostname" },
    { key: "region", label: "Region" },
    { key: "workflow", label: "Workflow" },
    { key: "status", label: "Status" },
    { key: "release", label: "Release" },
  ];

  const truncateData = (data) => {
    if (data.length > MAX_TABLE_DATA_LENGTH) {
      return data.substring(0, MAX_TABLE_DATA_LENGTH) + "...";
    }
    return data;
  };

  const handleMouseEnter = (data) => {
    setHoveredData(data);
  };

  const handleMouseLeave = () => {
    setHoveredData(null);
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
                  {people.map((person) => (
                    <tr key={person.started}>
                      {tableHeaders.map(({ key }) => {
                        const cellData = person[key];
                        const isTruncated =
                          cellData.length > MAX_TABLE_DATA_LENGTH;

                        return (
                          <td
                            key={key}
                            className={`whitespace-nowrap px-3 py-4 text-sm text-gray-600 ${
                              isTruncated ? "relative cursor-pointer" : ""
                            }`}
                            onMouseEnter={() =>
                              isTruncated && handleMouseEnter(cellData)
                            }
                            onMouseLeave={() =>
                              isTruncated && handleMouseLeave()
                            }
                          >
                            {isTruncated ? truncateData(cellData) : cellData}
                            {isTruncated && hoveredData === cellData && (
                              <div className="absolute bg-gray-100 p-2 shadow-md z-10">
                                {cellData}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <a
                          href="#"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit<span className="sr-only">, {person.name}</span>
                        </a>
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
