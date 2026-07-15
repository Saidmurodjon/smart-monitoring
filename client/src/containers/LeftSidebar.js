import { useState } from "react";
import routes from "../routes/sidebar";
import { NavLink, useLocation } from "react-router-dom";
import SidebarSubmenu from "./SidebarSubmenu";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import { getCurrentUser } from "../utils/authUser";
import Avatar from "../components/Avatar";

const ROLE_LABELS = { ADMIN: "Administrator", ENGINEER: "Muhandis", VIEWER: "Kuzatuvchi" };
const ROLE_BADGE_STYLE = { ADMIN: "badge-primary", ENGINEER: "badge-info", VIEWER: "badge-ghost" };
const ROLE_RING_STYLE = { ADMIN: "ring ring-primary", ENGINEER: "ring ring-info", VIEWER: "ring ring-base-300" };

const isVisible = (item, role) => !item.roles || item.roles.includes(role);
const COLLAPSE_STORAGE_KEY = "sidebar-collapsed";

function LeftSidebar() {
  const location = useLocation();
  const user = getCurrentUser();
  const role = user?.role || null;
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1");

  const visibleRoutes = routes
    .filter((route) => isVisible(route, role))
    .map((route) =>
      route.submenu ? { ...route, submenu: route.submenu.filter((item) => isVisible(item, role)) } : route,
    )
    .filter((route) => !route.submenu || route.submenu.length > 0);

  const close = (e) => {
    document.getElementById("left-sidebar-drawer").click();
  };

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="drawer-side ">
      <label htmlFor="left-sidebar-drawer" className="drawer-overlay lg:hidden"></label>
      <ul
        className={
          "menu pt-2 bg-base-100 text-base-content transition-all duration-200 min-h-screen flex flex-col " +
          (collapsed ? "lg:w-20 w-64" : "w-64")
        }
      >
        <button
          className="btn btn-ghost bg-base-300  btn-circle z-50 top-0 right-0 mt-4 mr-2 absolute lg:hidden"
          onClick={() => close()}
        >
          <XMarkIcon className="h-5 inline-block w-5" />
        </button>

        {/* Logotip — bosilganda sidebar kenglig'ini almashtiradi (yig'ish/kengaytirish) */}
        <li className="mb-2 font-semibold text-xl">
          <button
            type="button"
            onClick={toggleCollapsed}
            className={`w-full flex items-center gap-2 rounded-btn hover:bg-base-200 py-2 ${
              collapsed ? "justify-center" : "px-3"
            }`}
            title={collapsed ? "Kengaytirish" : "Yig'ish"}
          >
            <img
              className="mask mask-squircle w-10"
              src="/logo192.png"
              alt="Smart Monitoring logo"
            />
            {!collapsed && "Smart Monitoring"}
          </button>
        </li>

        {/* Nav bandlari */}
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

        {/* Joriy foydalanuvchi — pastga tortilgan */}
        {user && (
          <li className="mt-auto pt-3 border-t border-base-200">
            {collapsed ? (
              <div className="flex items-center justify-center py-2 pointer-events-none">
                <Avatar
                  email={user.email}
                  size="w-9"
                  textSize="text-base"
                  ringClassName={ROLE_RING_STYLE[role] || ""}
                />
              </div>
            ) : (
              <div className="flex flex-col items-start gap-1 py-2 pointer-events-none">
                <span className="text-sm text-base-content/70 break-all">{user.email}</span>
                <span className={`badge badge-sm ${ROLE_BADGE_STYLE[role] || "badge-ghost"}`}>
                  {ROLE_LABELS[role] || role}
                </span>
              </div>
            )}
          </li>
        )}
      </ul>
    </div>
  );
}

export default LeftSidebar;
