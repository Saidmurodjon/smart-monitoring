// All components mapping with path for internal routes

import { lazy } from "react";

const Dashboard = lazy(() => import("../pages/protected/Dashboard"));
const Welcome = lazy(() => import("../pages/protected/Welcome"));
const Page404 = lazy(() => import("../pages/protected/404"));
const Blank = lazy(() => import("../pages/protected/Blank"));
const Charts = lazy(() => import("../pages/protected/Charts"));
const Integration = lazy(() => import("../pages/protected/Integration"));
const Calendar = lazy(() => import("../pages/protected/Calendar"));
const Team = lazy(() => import("../pages/protected/Team"));
const Bills = lazy(() => import("../pages/protected/Bills"));
const ProfileSettings = lazy(() =>import("../pages/protected/ProfileSettings"));
const GettingStarted = lazy(() => import("../pages/GettingStarted"));
const DocFeatures = lazy(() => import("../pages/DocFeatures"));
const DocComponents = lazy(() => import("../pages/DocComponents"));

// Ges route
const GesInfo = lazy(() => import("../pages/ges/GesInfo"));
const GesList = lazy(() => import("../pages/ges/list"));
const GesAddNew = lazy(() => import("../pages/ges/AddNew"));
const Aggregates = lazy(() => import("../pages/aggregates/list"));
const AggregatesAddNew = lazy(() => import("../pages/aggregates/AddNew"));
const GesEdit = lazy(() => import("../pages/ges/Edit"));
// calculation route

const routes = [
  {
    path: "/dashboard", // the url
    component: Dashboard, // view rendered
  },



  // course's route
  {
    path: "/ges/", // the url
    component: GesInfo, // view rendered
  },
    {
    path: "/ges-list", // the url
    component: GesList, // view rendered
  },
      {
    path: "/ges-list/ges", // the url
    component: GesInfo, // view rendered
  },
  {
    path: "/ges-list/add-new", // the url
    component: GesAddNew, // view rendered
  },
  {
    path: "/ges/edit", // the url
    component: GesEdit, // view rendered
  },
    {
    path: "ges/aggregates", // the url
    component: Aggregates, // view rendered
  },
  {
    path: "ges/aggregates/add-new", // the url
    component: AggregatesAddNew, // view rendered
  },


  {
    path: "/welcome", // the url
    component: Welcome, // view rendered
  },
  {
    path: "/settings-team",
    component: Team,
  },
  {
    path: "/calendar",
    component: Calendar,
  },

  {
    path: "/settings-profile",
    component: ProfileSettings,
  },
  {
    path: "/settings-billing",
    component: Bills,
  },
  {
    path: "/getting-started",
    component: GettingStarted,
  },
  {
    path: "/features",
    component: DocFeatures,
  },
  {
    path: "/components",
    component: DocComponents,
  },
  {
    path: "/charts",
    component: Charts,
  },
  {
    path: "/404",
    component: Page404,
  },
  {
    path: "/blank",
    component: Blank,
  },
  
];

export default routes;
