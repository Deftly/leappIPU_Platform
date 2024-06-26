import { useMemo, useEffect, useRef, Fragment, useState } from "react";
import { Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import useWorkflowTypeOptions from "../../hooks/useWorkflowTypeOptions"; // Import the custom hook

import {
  FILTER_TEXT_LENGTH,
  VALID_WORKFLOW_TYPES,
} from "../../utils/constants";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const formatWorkflowType = (workflowType) => {
  return workflowType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const WorkflowTypeFilter = ({
  selectedWorkflowTypes,
  onWorkflowTypeChange,
}) => {
  const { workflowTypes, isLoading, error } = useWorkflowTypeOptions(); // Use the custom hook
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (event) => {
    const { value, checked } = event.target;
    const updatedWorkflowTypes = checked
      ? [...selectedWorkflowTypes, value]
      : selectedWorkflowTypes.filter((type) => type !== value);
    onWorkflowTypeChange(updatedWorkflowTypes);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectAll = () => {
    if (workflowTypes) {
      onWorkflowTypeChange(workflowTypes);
    }
  };

  const deselectAll = () => {
    onWorkflowTypeChange([]);
  };

  const displayText = useMemo(() => {
    if (isLoading) {
      return "Loading workflow types...";
    } else if (selectedWorkflowTypes.length === 0) {
      return "Select Workflow Type";
    } else if (
      workflowTypes &&
      selectedWorkflowTypes.length === workflowTypes.length
    ) {
      return "All Workflow Types";
    } else {
      const selectedText = selectedWorkflowTypes
        .map(formatWorkflowType)
        .join(", ");
      return selectedText.length > FILTER_TEXT_LENGTH
        ? `${selectedText.slice(0, FILTER_TEXT_LENGTH)}...`
        : selectedText;
    }
  }, [selectedWorkflowTypes, workflowTypes, isLoading]);

  if (error) {
    return <div>Error loading workflow types.</div>;
  }

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={toggleDropdown}
        className={`inline-flex w-full justify-between gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 ${
          selectedWorkflowTypes.length === 0 ? "text-gray-500" : "text-gray-900"
        }`}
      >
        {displayText}
        <ChevronDownIcon
          className="-mr-1 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </button>

      <Transition
        show={isOpen}
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {workflowTypes && (
              <div className="flex justify-between px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900">
                <div>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-blue-500 hover:text-blue-700 focus:outline-none"
                  >
                    All
                  </button>
                  <span className="mx-2">|</span>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="text-blue-500 hover:text-blue-700 focus:outline-none"
                  >
                    None
                  </button>
                </div>
              </div>
            )}
            {workflowTypes && (
              <>
                {workflowTypes
                  .filter((type) => VALID_WORKFLOW_TYPES.includes(type))
                  .map((type) => (
                    <div
                      key={type}
                      className={classNames(
                        "block px-4 py-2 text-sm cursor-pointer",
                        selectedWorkflowTypes.includes(type)
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700",
                      )}
                      onClick={() =>
                        handleChange({
                          target: {
                            value: type,
                            checked: !selectedWorkflowTypes.includes(type),
                          },
                        })
                      }
                    >
                      <input
                        type="checkbox"
                        value={type}
                        checked={selectedWorkflowTypes.includes(type)}
                        onChange={handleChange}
                        className="form-checkbox h-4 w-4 text-blue-500 transition duration-150 ease-in-out mr-2"
                      />
                      {formatWorkflowType(type)}
                    </div>
                  ))}

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-sm text-gray-500">
                      Invalid Workflow Types
                    </span>
                  </div>
                </div>

                {workflowTypes
                  .filter((type) => !VALID_WORKFLOW_TYPES.includes(type))
                  .map((type) => (
                    <div
                      key={type}
                      className={classNames(
                        "block px-4 py-2 text-sm cursor-pointer",
                        selectedWorkflowTypes.includes(type)
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700",
                      )}
                      onClick={() =>
                        handleChange({
                          target: {
                            value: type,
                            checked: !selectedWorkflowTypes.includes(type),
                          },
                        })
                      }
                    >
                      <input
                        type="checkbox"
                        value={type}
                        checked={selectedWorkflowTypes.includes(type)}
                        onChange={handleChange}
                        className="form-checkbox h-4 w-4 text-blue-500 transition duration-150 ease-in-out mr-2"
                      />
                      {formatWorkflowType(type)}
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default WorkflowTypeFilter;
