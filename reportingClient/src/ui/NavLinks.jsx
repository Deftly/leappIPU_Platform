import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import clsx from "clsx";
import {
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  ServerStackIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const links = [
  { name: "Dashboard", href: "/", icon: AdjustmentsHorizontalIcon },
  { name: "Workflows", href: "/workflows", icon: CheckCircleIcon },
  { name: "Hosts", href: "/hosts", icon: ServerStackIcon },
  { name: "FAQ", href: "/FAQ", icon: QuestionMarkCircleIcon },
];

const NavLinks = () => {
  const location = useLocation();
  const [activeButton, setActiveButton] = useState(null);

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = activeButton === link.name;

        return (
          <NavLink
            key={link.name}
            to={link.href}
            className={clsx(
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-100 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
              "transition duration-300 ease-in-out transform hover:-translate-y-1",
              "shadow-md hover:shadow-lg",
              {
                "bg-sky-100 text-blue-600": location.pathname === link.href,
                "pointer-events-none": isActive,
              },
            )}
            onClick={() => handleButtonClick(link.name)}
          >
            <LinkIcon className="w-6" />
            <p className="hidden pl-3 md:block">{link.name}</p>
          </NavLink>
        );
      })}
    </>
  );
};

export default NavLinks;
