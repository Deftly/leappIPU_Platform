const StatusBadge = ({ failed }) => {
  const badgeClasses = failed
    ? "bg-red-100 text-red-800"
    : "bg-green-500 text-white";

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium ${badgeClasses}`}
    >
      {failed ? "Failed" : "Successful"}
    </span>
  );
};

export default StatusBadge;
