import clsx from "clsx";

const Heading = ({ as: Component = "h1", children, className }) => {
  const classes = clsx(
    "leading-7 text-gray-900 sm:tracking-tight",
    {
      "text-3xl font-semibold sm:text-4xl": Component === "h1",
      "text-2xl font-semibold sm:text-3xl": Component === "h2",
      "text-xl font-semibold sm:text-2xl": Component === "h3",
    },
    className,
  );

  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <Component className={classes}>{children}</Component>
      </div>
    </div>
  );
};

export default Heading;
