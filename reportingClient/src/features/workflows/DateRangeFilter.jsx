import { useState } from "react";
import { DatePicker } from "antd";

const { RangePicker } = DatePicker;

const DateRangeFilter = ({ onDateRangeChange }) => {
  const [dates, setDates] = useState([]);

  const handleChange = (dates) => {
    setDates(dates);
    onDateRangeChange(dates);
  };

  return (
    <RangePicker
      value={dates}
      onChange={handleChange}
      format="MM/DD/YYYY"
      placeholder={["Start Date", "End Date"]}
    />
  );
};

export default DateRangeFilter;
