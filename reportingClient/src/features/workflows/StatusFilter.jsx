import { useEffect, useRef, Fragment } from "react";
import {
  Menu,
  MenuItems,
  MenuItem,
  MenuButton,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

import StatusBadge from "../../ui/StatusBadge";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const StatusFilter = ({ selectedStatus, onStatusChange }) => {
  const dropdownRef = useRef(null);

  const handleChange = (event) => {
    const { value } = event.target;
    onStatusChange(value === "all" ? null : value === "true");
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      dropdownRef.current.click();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Menu
      as="div"
      ref={dropdownRef}
      className="relative inline-block text-left"
    >
      <div>
        <MenuButton
          className={`inline-flex w-full justify-between gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 ${
            selectedStatus === null ? "text-gray-500" : "text-gray-900"
          }`}
        >
          {selectedStatus === null ? (
            "All"
          ) : selectedStatus ? (
            <StatusBadge failed={true}>Failed </StatusBadge>
          ) : (
            <StatusBadge failed={false}>Succeeded </StatusBadge>
          )}
          <ChevronDownIcon
            className="-mr-1 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </MenuButton>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems
          static
          className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div className="py-1">
            <MenuItem>
              {({ active }) => (
                <label
                  className={classNames(
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "block px-4 py-2 text-sm cursor-pointer",
                  )}
                >
                  <input
                    type="radio"
                    value="all"
                    checked={selectedStatus === null}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-500 transition duration-150 ease-in-out mr-2"
                  />
                  All
                </label>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <label
                  className={classNames(
                    focus ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "block px-4 py-2 text-sm cursor-pointer",
                  )}
                >
                  <input
                    type="radio"
                    value="false"
                    checked={selectedStatus === false}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-500 transition duration-150 ease-in-out mr-2"
                  />
                  <StatusBadge failed={false}>Succeeded </StatusBadge>
                </label>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <label
                  className={classNames(
                    focus ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "block px-4 py-2 text-sm cursor-pointer",
                  )}
                >
                  <input
                    type="radio"
                    value="true"
                    checked={selectedStatus === true}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-500 transition duration-150 ease-in-out mr-2"
                  />
                  <StatusBadge failed={true}>Failed</StatusBadge>
                </label>
              )}
            </MenuItem>
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
};

export default StatusFilter;
