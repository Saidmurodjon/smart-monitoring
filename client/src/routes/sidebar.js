/** Icons are imported separatly to reduce build time */
// import BellIcon from '@heroicons/react/24/outline/BellIcon'
import DocumentTextIcon from "@heroicons/react/24/outline/DocumentTextIcon";
import Squares2X2Icon from "@heroicons/react/24/outline/Squares2X2Icon";
import TableCellsIcon from "@heroicons/react/24/outline/TableCellsIcon";
import WalletIcon from "@heroicons/react/24/outline/WalletIcon";
import CodeBracketSquareIcon from "@heroicons/react/24/outline/CodeBracketSquareIcon";
import DocumentIcon from "@heroicons/react/24/outline/DocumentIcon";
import {

  UsersIcon,
  KeyIcon,
  DocumentDuplicateIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const iconClasses = `h-6 w-6`;
const submenuIconClasses = `h-5 w-5`;

const routes = [
  {
    path: "/app/dashboard",
    icon: <Squares2X2Icon className={iconClasses} />,
    name: "Dashboard",
  },

  // {
  //   path: "/app/leads", // url
  //   icon: <InboxArrowDownIcon className={iconClasses} />, // icon component
  //   name: "Leads", // name that appear in Sidebar
  // },
  // {
  //   path: "/app/transactions", // url
  //   icon: <CurrencyDollarIcon className={iconClasses} />, // icon component
  //   name: "Transactions", // name that appear in Sidebar
  // },
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
      },
    ],
  },
  {
    path: "", //no url needed as this has submenu
    icon: <DocumentDuplicateIcon className={`${iconClasses} inline`} />, // icon component
    name: "Pages", // name that appear in Sidebar
    submenu: [
      {
        path: "/login",
        icon: <ArrowRightOnRectangleIcon className={submenuIconClasses} />,
        name: "Login",
      },
      {
        path: "/register", //url
        icon: <UserIcon className={submenuIconClasses} />, // icon component
        name: "Register", // name that appear in Sidebar
      },
      {
        path: "/forgot-password",
        icon: <KeyIcon className={submenuIconClasses} />,
        name: "Forgot Password",
      },
      {
        path: "/app/blank",
        icon: <DocumentIcon className={submenuIconClasses} />,
        name: "Blank Page",
      },
      {
        path: "/app/404",
        icon: <ExclamationTriangleIcon className={submenuIconClasses} />,
        name: "404",
      },
    ],
  },
  {
    path: "", //no url needed as this has submenu
    icon: <Cog6ToothIcon className={`${iconClasses} inline`} />, // icon component
    name: "Settings", // name that appear in Sidebar
    submenu: [
      {
        path: "/app/settings-profile", //url
        icon: <UserIcon className={submenuIconClasses} />, // icon component
        name: "Profile", // name that appear in Sidebar
      },
      {
        path: "/app/settings-billing",
        icon: <WalletIcon className={submenuIconClasses} />,
        name: "Billing",
      },
      {
        path: "/app/settings-team", // url
        icon: <UsersIcon className={submenuIconClasses} />, // icon component
        name: "Team Members", // name that appear in Sidebar
      },
    ],
  },
  // ! new

  //!new
  {
    path: "", //no url needed as this has submenu
    icon: <DocumentTextIcon className={`${iconClasses} inline`} />, // icon component
    name: "Documentation", // name that appear in Sidebar
    submenu: [
      {
        path: "/app/getting-started", // url
        icon: <DocumentTextIcon className={submenuIconClasses} />, // icon component
        name: "Getting Started", // name that appear in Sidebar
      },
      {
        path: "/app/features",
        icon: <TableCellsIcon className={submenuIconClasses} />,
        name: "Features",
      },
      {
        path: "/app/components",
        icon: <CodeBracketSquareIcon className={submenuIconClasses} />,
        name: "Components",
      },
    ],
  },
];

export default routes;
