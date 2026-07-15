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
import { getCurrentUser } from "../utils/authUser";

const ROLE_LABELS = { ADMIN: "Administrator", ENGINEER: "Muhandis", VIEWER: "Kuzatuvchi" };

function Header() {
  const dispatch = useDispatch();
  const { pageTitle } = useSelector((state) => state.header);
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme")
  );
  const user = getCurrentUser();
  const initial = (user?.email || "?").charAt(0).toUpperCase();

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
      <div className="navbar  flex justify-between bg-base-100  z-10 shadow-md ">
        {/* Menu toogle for mobile view or small screen */}
        <div className="">
          <label
            htmlFor="left-sidebar-drawer"
            className="btn btn-primary drawer-button"
          >
            <Bars3Icon className="h-5 inline-block w-5" />
          </label>
          <h1 className="text-2xl font-semibold ml-2">{pageTitle}</h1>
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
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-10">
                <span className="text-lg">{initial}</span>
              </div>
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
