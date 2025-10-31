import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import http from "../../utils/http";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const initial = {
  items: [],
  stats: { total: 0, running: 0, maintenance: 0, building: 0, stopped: 0 },
  loading: false,
  error: null,
};
// ---- helpers ----
const norm = (v) => {
  if (!v) return "";
  // { $oid: "..." } ko‘rinishlarini ham qo‘llab-quvvatlaymiz
  if (typeof v === "object" && v.$oid) return String(v.$oid).trim();
  return String(v).trim();
};
const getId = (obj) => norm(obj?._id ?? obj?.id);



function recomputeStats(items) {
  const s = { total: items.length, running: 0, maintenance: 0, building: 0, stopped: 0 };
  for (const g of items) {
    const st = (g.status || "").toLowerCase();
    if (st === "running") s.running++;
    else if (st === "maintenance") s.maintenance++;
    else if (st === "building") s.building++;
    else if (st === "stopped") s.stopped++;
  }
  return s;
}

// ---- THUNK: ro‘yxatni olish (region/name filtr bilan) ----
export const fetchGesList = createAsyncThunk(
  "ges/fetchList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const qs = new URLSearchParams(params).toString();
    //   console.log(qs);
      
      const { data } = await http.get(`${API}/ges-list${qs ? `?${qs}` : ""}`, {
          
          withCredentials: true,
          headers: (() => {
              const t = localStorage.getItem("token");
              return t ? { Authorization: `Bearer ${t}` } : {};
            })(),
        });
      return Array.isArray(data) ? data : data?.data || data?.items || data?.results || [];
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

const gesSlice = createSlice({
  name: "ges",
  initialState: initial,
  reducers: {
    setGesList: (state, { payload }) => {
      state.items = payload || [];
      state.stats = recomputeStats(state.items);
    },
addGes: (state, { payload }) => {
const id = payload._id || payload.id;
  const i = state.items.findIndex((x) => x._id === id);
},
updateGes: (state, { payload }) => {
  const id = payload._id || payload.id;
  const i = state.items.findIndex((x) => x._id == id);
  console.log(payload._id);
  console.log(typeof payload._id);
  if (i >= 0) state.items[i] = { ...state.items[i], ...payload };
  state.stats = recomputeStats(state.items);
},
// updateGes: (state, { payload }) => {
//   const pid = getId(payload);                              // <- "6904d3063d9a058ec43de39b"
//   const i = state.items.findIndex((x) => getId(x) === pid); // har ikkala tomonni normalladik
//   if (i !== -1) {
//     state.items[i] = { ...state.items[i], ...payload, _id: pid };
//   } else {
//     // ehtiyot chorasi: RT oqimda topilmasa qo‘shib qo‘yamiz (upsert)
//     state.items.unshift({ ...payload, _id: pid });
//   }
//   state.stats = recomputeStats(state.items);
//   console.log(state.items);
// },

removeGes: (state, { payload }) => {
  const id = payload._id || payload.id;
  state.items = state.items.filter((x) => (x._id || x.id) !== id);
  state.stats = recomputeStats(state.items);
},
    clearGesError: (state) => { state.error = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchGesList.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(fetchGesList.fulfilled, (s, { payload }) => {
      s.loading = false;
      s.items = payload || [];
      s.stats = recomputeStats(s.items);
    });
    b.addCase(fetchGesList.rejected, (s, { payload }) => {
      s.loading = false; s.error = payload || "Fetch error";
    });
  },
});

export const { setGesList, addGes, updateGes, removeGes, clearGesError } = gesSlice.actions;
export default gesSlice.reducer;

// ---- Selectors (qulay foydalanish uchun) ----
export const selectGesItems   = (s) => s.ges.items;
export const selectGesStats   = (s) => s.ges.stats;
export const selectGesLoading = (s) => s.ges.loading;
export const selectGesError   = (s) => s.ges.error;
