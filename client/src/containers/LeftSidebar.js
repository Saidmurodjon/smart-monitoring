import { useSelector } from "react-redux";
import routes from "../routes/sidebar";
import { NavLink, useLocation } from "react-router-dom";
import SidebarSubmenu from "./SidebarSubmenu";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import { getCurrentUser } from "../utils/authUser";

const isVisible = (item, role) => !item.roles || item.roles.includes(role);

function LeftSidebar() {
  const location = useLocation();
  const user = getCurrentUser();
  const role = user?.role || null;
  const collapsed = useSelector((s) => s.sidebar.collapsed);

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
    <div className="drawer-side z-50">
      <label htmlFor="left-sidebar-drawer" className="drawer-overlay lg:hidden"></label>
      <ul
        className={
          "menu pt-2 bg-base-100 text-base-content transition-all duration-200 " +
          (collapsed ? "lg:w-20 w-64" : "w-64")
        }
      >
        <button
          className="btn btn-ghost bg-base-300  btn-circle z-50 top-0 right-0 mt-4 mr-2 absolute lg:hidden"
          onClick={() => close()}
        >
          <XMarkIcon className="h-5 inline-block w-5" />
        </button>

        {visibleRoutes.map((route, k) => {
          return (
            <li className="" key={k}>
              {route.submenu ? (
                <SidebarSubmenu {...route} collapsed={collapsed} />
              ) : (
                <NavLink
                  end
                  to={route.path}
                  className={({ isActive }) =>
                    `${collapsed ? "justify-center " : ""}${
                      isActive ? "font-semibold  bg-base-200 " : "font-normal"
                    }`
                  }
                  title={collapsed ? route.name : undefined}
                >
                  {route.icon} {!collapsed && route.name}
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
