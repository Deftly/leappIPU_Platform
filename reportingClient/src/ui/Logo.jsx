const Logo = () => {
  return (
    <div
      className="flex h-20 items-end justify-start rounded-md mb-2 p-1 md:h-40 border-blue-400 border-2" // Added border and border-gray-200 classes for a thin border
    >
      <div className="w-max">
        <img src="/bofa.png" className="w-auto h-36" />
      </div>
    </div>
  );
};

export default Logo;
