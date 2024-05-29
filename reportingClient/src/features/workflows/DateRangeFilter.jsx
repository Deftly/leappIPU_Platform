import { useState, useRef, useEffect, Fragment } from "react";
import { DateRangePicker } from "react-date-range";
import { CalendarIcon } from "@heroicons/react/20/solid";
import { Transition } from "@headlessui/react";
import {
  addDays,
  endOfDay,
  startOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "./DateRangeFilter.css";

const defineds = {
  startOfToday: startOfDay(new Date()),
  endOfToday: endOfDay(new Date()),
  startOfYesterday: startOfDay(addDays(new Date(), -1)),
  endOfYesterday: endOfDay(addDays(new Date(), -1)),
  startOfWeek: startOfWeek(new Date()),
  endOfWeek: endOfWeek(new Date()),
  startOfLastWeek: startOfWeek(addDays(new Date(), -7)),
  endOfLastWeek: endOfWeek(addDays(new Date(), -7)),
  startOfMonth: startOfMonth(new Date()),
  endOfMonth: endOfMonth(new Date()),
};

const staticRangeHandler = {
  range: {},
  isSelected(range) {
    const definedRange = this.range();
    return (
      isSameDay(range.startDate, definedRange.startDate) &&
      isSameDay(range.endDate, definedRange.endDate)
    );
  },
};

function createStaticRanges(ranges) {
  return ranges.map((range) => ({ ...staticRangeHandler, ...range }));
}

const staticRanges = createStaticRanges([
  {
    label: "Today",
    range: () => ({
      startDate: defineds.startOfToday,
      endDate: defineds.endOfToday,
    }),
  },
  {
    label: "Yesterday",
    range: () => ({
      startDate: defineds.startOfYesterday,
      endDate: defineds.endOfYesterday,
    }),
  },
  {
    label: "This Week",
    range: () => ({
      startDate: defineds.startOfWeek,
      endDate: defineds.endOfWeek,
    }),
  },
  {
    label: "Last Week",
    range: () => ({
      startDate: defineds.startOfLastWeek,
      endDate: defineds.endOfLastWeek,
    }),
  },
  {
    label: "This Month",
    range: () => ({
      startDate: defineds.startOfMonth,
      endDate: defineds.endOfMonth,
    }),
  },
]);

const DateRangeFilter = ({ onDateChange, startDate, endDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const [state, setState] = useState([
    {
      startDate: startDate || null,
      endDate: endDate || null,
      key: "selection",
    },
  ]);

  // TODO: Filter should only be applied after both dates are set
  // TODO: Setting the start should not change the end date
  const handleDateChange = (item) => {
    const { startDate, endDate } = item.selection;
    let newEndDate = endDate;

    if (startDate && !endDate) {
      newEndDate = state[0].endDate; // Keep the previous end date if it exists
    }

    setState([
      {
        startDate: startDate,
        endDate: newEndDate,
        key: "selection",
      },
    ]);

    if (startDate && newEndDate) {
      onDateChange({ startDate, endDate: newEndDate });
    }
  };

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {state[0].startDate && state[0].endDate ? (
            <>
              {state[0].startDate.toLocaleDateString()} -{" "}
              {state[0].endDate.toLocaleDateString()}
            </>
          ) : (
            <CalendarIcon
              className="w-5 h-5 text-gray-400"
              aria-hidden="true"
            />
          )}
        </span>
      </div>
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
        <div className="absolute z-10 mt-2 bg-white border border-gray-300 rounded-md shadow-lg date-range-filter">
          <DateRangePicker
            onChange={handleDateChange}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            months={2}
            ranges={state}
            direction="horizontal"
            rangeColors={["#3B82F6"]}
            maxDate={new Date()}
            staticRanges={staticRanges}
            inputRanges={[]}
            showDateDisplay={false}
          />
        </div>
      </Transition>
    </div>
  );
};

export default DateRangeFilter;
