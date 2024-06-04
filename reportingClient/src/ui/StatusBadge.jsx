const StatusBadge = ({ failed, timedOut, failedValidation }) => {
  const STATUS_CONFIGS = {
    success: {
      text: "Successful",
      classes: "bg-green-100 border-green-500 text-green-700",
    },
    failure: {
      text: "Failed",
      classes: "bg-red-100 border-red-500 text-red-700",
    },
    timedOut: {
      text: "Timed Out",
      classes: "bg-yellow-100 border-yellow-500 text-yellow-700",
    },
    failedValidation: {
      text: "Validation Failed",
      classes: "bg-orange-100 border-orange-500 text-orange-700",
    },
  };

  const getStatus = () => {
    if (timedOut) {
      return "timedOut";
    } else if (failedValidation) {
      return "failedValidation";
    } else if (failed) {
      return "failure";
    } else {
      return "success";
    }
  };

  const { text, classes } = STATUS_CONFIGS[getStatus()];

  return (
    <div className={`inline-block rounded-md ${classes}`}>
      <p className="text-xs font-semibold px-2 py-1">{text}</p>
    </div>
  );
};

export default StatusBadge;
