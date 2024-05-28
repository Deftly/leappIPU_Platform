const StatusBadge = ({ failed }) => {
  const badgeClasses = failed
    ? "bg-red-600/10 text-red-600 ring-red-400/20"
    : "bg-green-600/10 text-green-600 ring-green-600/20";

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${badgeClasses}`}
    >
      {failed ? "Failed" : "Successful"}
    </span>
  );
};

export default StatusBadge;
