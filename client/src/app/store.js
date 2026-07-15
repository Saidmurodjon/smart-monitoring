import { configureStore } from "@reduxjs/toolkit";
import headerSlice from "../features/common/headerSlice";
import modalSlice from "../features/common/modalSlice";
import rightDrawerSlice from "../features/common/rightDrawerSlice";
import sidebarSlice from "../features/common/sidebarSlice";
import leadsSlice from "../features/leads/leadSlice";
import ges from "../features/ges/gesSlice";

const combinedReducer = {
  header: headerSlice,
  rightDrawer: rightDrawerSlice,
  modal: modalSlice,
  sidebar: sidebarSlice,
  lead: leadsSlice,
  ges,
};

export default configureStore({
  reducer: combinedReducer,
});
