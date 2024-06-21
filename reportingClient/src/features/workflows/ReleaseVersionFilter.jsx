import { useState, useMemo, useEffect, useRef, Fragment } from "react";
import { Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import useReleaseVersions from "../../hooks/useReleaseVersions";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const ReleaseVersionFilter = ({ selectedReleases, onReleaseChange }) => {
  const { releases, isLoading, error } = useReleaseVersions();
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (event) => {
    const { value, checked } = event.target;
    const updatedReleases = checked
      ? [...selectedReleases, value]
      : selectedReleases.filter((release) => release !== value);
    onReleaseChange(updatedReleases);
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
    if (releases) {
      onReleaseChange(releases);
    }
  };

  const deselectAll = () => {
    onReleaseChange([]);
  };

  const displayText = useMemo(() => {
    if (isLoading) {
      return "Loading releases...";
    } else if (selectedReleases.length === 0) {
      return "Select Release";
    } else if (releases && selectedReleases.length === releases.length) {
      return "All Releases";
    } else {
      const selectedText = selectedReleases.join(", ");
      return selectedText.length > 20
        ? `${selectedText.slice(0, 20)}...`
        : selectedText;
    }
  }, [selectedReleases, releases, isLoading]);

  if (error) {
    return <div>Error loading releases.</div>;
  }

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={toggleDropdown}
        className={`inline-flex w-full justify-between gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 ${
          selectedReleases.length === 0 ? "text-gray-500" : "text-gray-900"
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
            {releases && (
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
            {releases &&
              releases.map((release) => (
                <div
                  key={release}
                  className={classNames(
                    "block px-4 py-2 text-sm cursor-pointer",
                    selectedReleases.includes(release)
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700",
                  )}
                  onClick={() =>
                    handleChange({
                      target: {
                        value: release,
                        checked: !selectedReleases.includes(release),
                      },
                    })
                  }
                >
                  <input
                    type="checkbox"
                    value={release}
                    checked={selectedReleases.includes(release)}
                    onChange={handleChange}
                    className="form-checkbox h-4 w-4 text-blue-500 transition duration-150 ease-in-out mr-2"
                  />
                  {release}
                </div>
              ))}
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default ReleaseVersionFilter;
