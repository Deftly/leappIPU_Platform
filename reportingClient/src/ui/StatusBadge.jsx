const StatusBadge = ({ failed }) => {
  const badgeClasses = failed
    ? "bg-red-100  border-red-500 text-red-700"
    : "bg-green-100  border-green-500 text-green-700";

  return (
    <div className={`inline-block rounded-md ${badgeClasses}`}>
      <p className="text-xs font-semibold px-2 py-1">
        {failed ? "Failed" : "Successful"}
      </p>
    </div>
  );
};

export default StatusBadge;
