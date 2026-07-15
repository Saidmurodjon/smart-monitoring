import routes from "../routes/sidebar";
import { NavLink, Link, useLocation } from "react-router-dom";
import SidebarSubmenu from "./SidebarSubmenu";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import { getCurrentUser } from "../utils/authUser";

const ROLE_LABELS = { ADMIN: "Administrator", ENGINEER: "Muhandis", VIEWER: "Kuzatuvchi" };
const ROLE_BADGE_STYLE = { ADMIN: "badge-primary", ENGINEER: "badge-info", VIEWER: "badge-ghost" };

const isVisible = (item, role) => !item.roles || item.roles.includes(role);

function LeftSidebar() {
  const location = useLocation();
  const user = getCurrentUser();
  const role = user?.role || null;
  const visibleRoutes = routes
    .filter((route) => isVisible(route, role))
    .map((route) =>
      route.submenu ? { ...route, submenu: route.submenu.filter((item) => isVisible(item, role)) } : route,
    )
    .filter((route) => !route.submenu || route.submenu.length > 0);


  const close = (e) => {
    document.getElementById("left-sidebar-drawer").click();
  };

  return (
    <div className="drawer-side ">
      <label htmlFor="left-sidebar-drawer" className="drawer-overlay"></label>
      <ul className="menu  pt-2 w-80 bg-base-100 text-base-content">
        <button
          className="btn btn-ghost bg-base-300  btn-circle z-50 top-0 right-0 mt-4 mr-2 absolute"
          onClick={() => close()}
        >
          <XMarkIcon className="h-5 inline-block w-5" />
        </button>

        <li className="mb-2 font-semibold text-xl">
          <Link to={"/app/dashboard"}>
            <img
              className="mask mask-squircle w-10"
              src="/logo192.png"
              alt="Smart Monitoring logo"
            />
            Smart Monitoring
          </Link>{" "}
        </li>

        {user && (
          <li className="mb-3">
            <div className="flex flex-col items-start gap-1 pointer-events-none">
              <span className="text-sm text-base-content/70 break-all">{user.email}</span>
              <span className={`badge badge-sm ${ROLE_BADGE_STYLE[role] || "badge-ghost"}`}>
                {ROLE_LABELS[role] || role}
              </span>
            </div>
          </li>
        )}

        {visibleRoutes.map((route, k) => {
          return (
            <li className="" key={k}>
              {route.submenu ? (
                <SidebarSubmenu {...route} />
              ) : (
                <NavLink
                  end
                  to={route.path}
                  className={({ isActive }) =>
                    `${
                      isActive ? "font-semibold  bg-base-200 " : "font-normal"
                    }`
                  }
                >
                  {route.icon} {route.name}
                  {location.pathname === route.path ? (
                    <span
                      className="absolute inset-y-0 left-0 w-1 rounded-tr-md rounded-br-md bg-primary "
                      aria-hidden="true"
                    ></span>
                  ) : null}
                </NavLink>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default LeftSidebar;
