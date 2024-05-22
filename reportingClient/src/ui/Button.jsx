import clsx from "clsx";

const Button = ({
  children,
  size = "medium",
  variation = "primary",
  className,
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    xs: "px-2 py-1 text-xs font-semibold",
    sm: "px-2 py-1 text-sm font-semibold",
    base: "px-2.5 py-1.5 text-sm font-semibold",
    md: "px-3 py-2 text-sm font-semibold",
    lg: "px-3.5 py-2.5 text-sm font-semibold",
  };

  // Variation classes
  const variationClasses = {
    primary: "text-blue-50 bg-blue-600 hover:bg-blue-700",
    disabled: "text-blue-50 bg-blue-200",
    secondary:
      "text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100",
    danger: "text-red-100 bg-red-500 hover:bg-red-600",
    // primary: "text-white bg-indigo-600 hover:bg-indigo-500",
    // Add more variation classes as needed
  };

  return (
    <button
      className={clsx(
        "rounded-md shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        sizeClasses[size],
        variationClasses[variation],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
