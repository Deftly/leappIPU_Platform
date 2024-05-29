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
  addMonths,
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
  endOfWeek:
    endOfWeek(new Date()) < new Date() ? endOfWeek(new Date()) : new Date(),
  startOfLastWeek: startOfWeek(addDays(new Date(), -7)),
  endOfLastWeek:
    endOfWeek(addDays(new Date(), -7)) < new Date()
      ? endOfWeek(addDays(new Date(), -7))
      : new Date(),
  startOfMonth: startOfMonth(new Date()),
  endOfMonth:
    endOfMonth(new Date()) < new Date() ? endOfMonth(new Date()) : new Date(),
  startOfLastMonth: startOfMonth(addMonths(new Date(), -1)),
  endOfLastMonth:
    endOfMonth(addMonths(new Date(), -1)) < new Date()
      ? endOfMonth(addMonths(new Date(), -1))
      : new Date(),
  startOfLast3Months: startOfMonth(addMonths(new Date(), -3)),
  endOfLast3Months:
    endOfMonth(new Date()) < new Date() ? endOfMonth(new Date()) : new Date(),
  startOfLast6Months: startOfMonth(addMonths(new Date(), -6)),
  endOfLast6Months:
    endOfMonth(new Date()) < new Date() ? endOfMonth(new Date()) : new Date(),
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
  {
    label: "Last Month",
    range: () => ({
      startDate: defineds.startOfLastMonth,
      endDate: defineds.endOfLastMonth,
    }),
  },
  {
    label: "Last 3 Months",
    range: () => ({
      startDate: defineds.startOfLast3Months,
      endDate: defineds.endOfLast3Months,
    }),
  },
  {
    label: "Last 6 Months",
    range: () => ({
      startDate: defineds.startOfLast6Months,
      endDate: defineds.endOfLast6Months,
    }),
  },
  {
    label: "Clear",
    range: () => ({
      startDate: null,
      endDate: null,
    }),
  },
]);

const DateRangeFilter = ({ onDateChange, startDate, endDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const [state, setState] = useState([
    {
      startDate: startDate || null,
      endDate: endDate || defineds.endOfToday,
      key: "selection",
    },
  ]);

  const handleDateChange = (item) => {
    const { startDate, endDate } = item.selection;

    if (startDate === null && endDate === null) {
      // Clear the date range filter
      setState([
        {
          startDate: null,
          endDate: null,
          key: "selection",
        },
      ]);
      onDateChange({ startDate: null, endDate: null });
    } else {
      let newEndDate = endDate;

      if (startDate && !endDate) {
        newEndDate = state[0].endDate;
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
            retainEndDateOnFirstSelection={true}
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
