import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";

const AppLayout = () => {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <Sidebar />
      </div>
      <div className="grow p-6 md:overflow-y-auto md:p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
