import { createSlice } from "@reduxjs/toolkit";

const COLLAPSE_STORAGE_KEY = "sidebar-collapsed";

export const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: {
    collapsed: localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1",
  },
  reducers: {
    toggleSidebarCollapsed: (state) => {
      state.collapsed = !state.collapsed;
      localStorage.setItem(COLLAPSE_STORAGE_KEY, state.collapsed ? "1" : "0");
    },
  },
});

export const { toggleSidebarCollapsed } = sidebarSlice.actions;

export default sidebarSlice.reducer;
