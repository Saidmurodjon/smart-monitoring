import { themeChange } from "theme-change";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Bars3Icon from "@heroicons/react/24/outline/Bars3Icon";
import MoonIcon from "@heroicons/react/24/outline/MoonIcon";
import SunIcon from "@heroicons/react/24/outline/SunIcon";
import ArrowPathIcon from "@heroicons/react/24/outline/ArrowPathIcon";
import { Link } from "react-router-dom";
import { fetchGesList } from "../features/ges/gesSlice";
import { showNotification } from "../features/common/headerSlice";
import { toggleSidebarCollapsed } from "../features/common/sidebarSlice";
import { getCurrentUser } from "../utils/authUser";
import Avatar from "../components/Avatar";

const ROLE_LABELS = { ADMIN: "Administrator", ENGINEER: "Muhandis", VIEWER: "Kuzatuvchi" };

function Header() {
  const dispatch = useDispatch();
  const { pageTitle } = useSelector((state) => state.header);
  const collapsed = useSelector((state) => state.sidebar.collapsed);
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme")
  );
  const user = getCurrentUser();

  useEffect(() => {
    themeChange(false);
    if (currentTheme === null) {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        setCurrentTheme("dark");
      } else {
        setCurrentTheme("light");
      }
    }
    // 👆 false parameter is required for react project
      // eslint-disable-next-line
  }, []);

  const refreshData = () => {
    dispatch(fetchGesList());
    dispatch(showNotification({ message: "Ma'lumotlar yangilandi", status: 1 }));
  };
  function logoutUser() {
    localStorage.clear();
    window.location.href = "/";
  }

  return (
    <>
      <div className="navbar fixed top-0 inset-x-0 z-40 w-full flex justify-between bg-base-100 shadow-md">
        <div className="flex items-center">
          {/* Mobile-only overlay drawer toggle */}
          <label
            htmlFor="left-sidebar-drawer"
            className="btn btn-primary drawer-button lg:hidden mr-2"
          >
            <Bars3Icon className="h-5 inline-block w-5" />
          </label>

          {/* Logotip — bosilganda sidebar kenglig'ini almashtiradi (yig'ish/kengaytirish).
              Kenglik/tekislash sidebar'ning o'z kengligiga mos keladi (w-64 / lg:w-20),
              shu sabab yig'ilganda logotip aynan sidebar ustuni markaziga tushadi. */}
          <button
            type="button"
            onClick={() => dispatch(toggleSidebarCollapsed())}
            className={
              "flex items-center gap-2 font-semibold text-xl hover:opacity-80 transition-all duration-200 w-64 justify-start px-3 " +
              (collapsed ? "lg:w-20 lg:justify-center lg:px-0" : "")
            }
            title="Sidebar'ni yig'ish/kengaytirish"
          >
            <img className="mask mask-squircle w-10 shrink-0" src="/logo192.png" alt="Smart Monitoring logo" />
            <span className={"hidden sm:inline " + (collapsed ? "lg:hidden" : "")}>Smart Monitoring</span>
          </button>

          {/* <h1 className="text-2xl font-semibold ml-4 hidden md:inline-block">{pageTitle}</h1> */}
        </div>

        <div className="order-last">
          {/* Refresh data */}
          <button
            className="btn btn-ghost btn-circle"
            onClick={() => refreshData()}
            aria-label="Yangilash"
          >
            <ArrowPathIcon className="h-6 w-6" />
          </button>

          {/* Light and dark theme selection toogle **/}
          <label className="swap ml-4">
            <input type="checkbox" />
            <SunIcon
              data-set-theme="light"
              data-act-class="ACTIVECLASS"
              className={
                "fill-current w-6 h-6 " +
                (currentTheme === "dark" ? "swap-on" : "swap-off")
              }
            />
            <MoonIcon
              data-set-theme="dark"
              data-act-class="ACTIVECLASS"
              className={
                "fill-current w-6 h-6 " +
                (currentTheme === "light" ? "swap-on" : "swap-off")
              }
            />
          </label>

          {/* Profile icon, opening menu on click */}
          <div className="dropdown dropdown-end ml-4">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <Avatar email={user?.email} />
            </label>
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-64"
            >
              {user && (
                <li className="pointer-events-none px-2 py-1">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-sm font-semibold break-all">{user.email}</span>
                    <span className="badge badge-sm badge-outline">
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </div>
                </li>
              )}
              <div className="divider mt-0 mb-0"></div>
              <li className="">
                <Link to={"/app/settings-profile"}>Profil sozlamalari</Link>
              </li>
              <div className="divider mt-0 mb-0"></div>
              <li>
                <span onClick={logoutUser}>Chiqish</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
