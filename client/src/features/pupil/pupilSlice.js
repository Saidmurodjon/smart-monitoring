import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const getPupilContent = createAsyncThunk("/pupil/content", async () => {
  const response = await axios.get("/api/users?page=2", {});
  return response.data;
});

export const pupilSlice = createSlice({
  name: "pupil",
  initialState: {
    isLoading: false,
    pupil: [],
  },
  reducers: {
    addNewPupil: (state, action) => {
      let { newPupilObj } = action.payload;
      state.pupil = [...state.pupil, newPupilObj];
    },

    deletePupil: (state, action) => {
      let { index } = action.payload;
      state.pupil.splice(index, 1);
    },
  },

  extraReducers: {
    [getPupilContent.pending]: (state) => {
      state.isLoading = true;
    },
    [getPupilContent.fulfilled]: (state, action) => {
      state.pupil = action.payload.data;
      state.isLoading = false;
    },
    [getPupilContent.rejected]: (state) => {
      state.isLoading = false;
    },
  },
});

export const { addNewPupil, deletePupil } = pupilSlice.actions;

export default pupilSlice.reducer;
