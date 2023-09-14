// All components mapping with path for internal routes

import { lazy } from "react";

const Dashboard = lazy(() => import("../pages/protected/Dashboard"));
const Welcome = lazy(() => import("../pages/protected/Welcome"));
const Page404 = lazy(() => import("../pages/protected/404"));
const Blank = lazy(() => import("../pages/protected/Blank"));
const Charts = lazy(() => import("../pages/protected/Charts"));
const Leads = lazy(() => import("../pages/protected/Leads"));
const Integration = lazy(() => import("../pages/protected/Integration"));
const Calendar = lazy(() => import("../pages/protected/Calendar"));
const Team = lazy(() => import("../pages/protected/Team"));
const Transactions = lazy(() => import("../pages/protected/Transactions"));
const Bills = lazy(() => import("../pages/protected/Bills"));
const ProfileSettings = lazy(() =>
  import("../pages/protected/ProfileSettings")
);
const GettingStarted = lazy(() => import("../pages/GettingStarted"));
const DocFeatures = lazy(() => import("../pages/DocFeatures"));
const DocComponents = lazy(() => import("../pages/DocComponents"));
//! new routes
const Teacher = lazy(() => import("../pages/teacher/index"));
const TeacherAddNew = lazy(() => import("../pages/teacher/AddNew"));
const TeacherEdit = lazy(() => import("../pages/teacher/Edit"));
// course's route
const Course = lazy(() => import("../pages/course/index"));
const CourseAddNew = lazy(() => import("../pages/course/AddNew"));
const CourseEdit = lazy(() => import("../pages/course/Edit"));
// pupil route
const Pupil = lazy(() => import("../pages/pupil/index"));
const PupilAddNew = lazy(() => import("../pages/pupil/AddNew"));
const PupilEdit = lazy(() => import("../pages/pupil/Edit"));
// calculation route

const Fee = lazy(() => import("../pages/fee/Index"));
const FeeAddNew = lazy(() => import("../pages/fee/AddNew"));
const routes = [
  {
    path: "/dashboard", // the url
    component: Dashboard, // view rendered
  },

  {
    path: "/teacher", // the url
    component: Teacher, // view rendered
  },
  {
    path: "/teacher/add-new", // the url
    component: TeacherAddNew, // view rendered
  },
  {
    path: "/teacher/edit/:id", // the url
    component: TeacherEdit, // view rendered
  },
  // course's route
  {
    path: "/course", // the url
    component: Course, // view rendered
  },
  {
    path: "/course/add-new", // the url
    component: CourseAddNew, // view rendered
  },
  {
    path: "/course/edit/:id", // the url
    component: CourseEdit, // view rendered
  },
  // course's route
  {
    path: "/pupil", // the url
    component: Pupil, // view rendered
  },
  {
    path: "/pupil/add-new", // the url
    component: PupilAddNew, // view rendered
  },
  {
    path: "/pupil/edit", // the url
    component: PupilEdit, // view rendered
  },
  // ! calculation start
  {
    path: "/fee", // the url //! contract's payment
    component: Fee, // view rendered
  },
  {
    path: "/fee/add-new", // the url //!  contract's payment add new
    component: FeeAddNew, // view rendered
  },
  {
    path: "/fee/edit", // the url //! contract's payment edit
    component: FeeAddNew, // view rendered
  },
  // ! calculation end
  {
    path: "/welcome", // the url
    component: Welcome, // view rendered
  },
  {
    path: "/leads",
    component: Leads,
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
    path: "/transactions",
    component: Transactions,
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
    path: "/integration",
    component: Integration,
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
