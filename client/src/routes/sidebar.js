/** Icons are imported separatly to reduce build time */
import Squares2X2Icon from "@heroicons/react/24/outline/Squares2X2Icon";
import WalletIcon from "@heroicons/react/24/outline/WalletIcon";
import AdjustmentsHorizontalIcon from "@heroicons/react/24/outline/AdjustmentsHorizontalIcon";
import Cog6ToothIcon from "@heroicons/react/24/outline/Cog6ToothIcon";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
import UserIcon from "@heroicons/react/24/outline/UserIcon";

const iconClasses = `h-6 w-6`;
const submenuIconClasses = `h-5 w-5`;

const routes = [
  {
    path: "/app/dashboard",
    icon: <Squares2X2Icon className={iconClasses} />,
    name: "Dashboard",
  },
  {
    path: "", //no url needed as this has submenu
    icon: <Cog6ToothIcon className={`${iconClasses} inline`} />, // icon component
    name: "Ges haqida ma'lumot", // name that appear in Sidebar
    submenu: [
      {
        path: "/app/ges-list", //url
        icon: <UserIcon className={submenuIconClasses} />, // icon component
        name: "Ges", // name that appear in Sidebar
      },
      {
        path: "/app/ges-list/add-new",
        icon: <WalletIcon className={submenuIconClasses} />,
        name: "Yangi GES ni qo‘shish",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    path: "/app/fuzzy-rules",
    icon: <AdjustmentsHorizontalIcon className={iconClasses} />,
    name: "Fuzzy Logic qoidalari",
    roles: ["ADMIN"],
  },
  {
    path: "/app/users",
    icon: <UsersIcon className={iconClasses} />,
    name: "Foydalanuvchilar",
    roles: ["ADMIN"],
  },
  {
    path: "/app/settings-profile",
    icon: <UserIcon className={iconClasses} />,
    name: "Profil sozlamalari",
  },
];

export default routes;
