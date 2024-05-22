import Logo from "./Logo";
import NavLinks from "./NavLinks";

const Sidebar = () => {
  return (
    <div className="flex h-full flex-col ml-2 px-3 py-4 md:px-2">
      <Logo />
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-100 md:block"></div>
      </div>
    </div>
  );
};

export default Sidebar;
