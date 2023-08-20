import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


  export const getPupilsContent = createAsyncThunk("/pupils/content", async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_SERVER_URL+"pupils");
      return response.data
    } catch (error) {
      console.error("Error fetching pupils content:", error);
      throw error;
    }
  });
export const pupilsSlice = createSlice({
  name: "pupils",
  initialState: {
    isLoading: false,
    pupils: [],
  },
  reducers: {
    addNewLead: (state, action) => {
      let { newPupilObj } = action.payload;
      console.log(action.payload);
      state.pupils = [...state.pupils, newPupilObj];
    },

    deleteLead: (state, action) => {
      let { index } = action.payload;
      state.pupils.splice(index, 1);
    },
  },

  extraReducers: {
    [getPupilsContent.pending]: (state) => {
        console.log(state);
      state.isLoading = true;
    },
    [getPupilsContent.fulfilled]: (state, action) => {
      state.pupils = action.payload;
      state.isLoading = false;
    },
    [getPupilsContent.rejected]: (state) => {
      state.isLoading = false;
    },
  },
});

export const { addNewLead, deleteLead } = pupilsSlice.actions;

export default pupilsSlice.reducer;
