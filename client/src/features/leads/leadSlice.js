import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'



// export const getLeadsContent = createAsyncThunk('/leads/content', async () => {
// 	const response = await axios.get('/api/users?page=2', {})
// 	return response.data;
// })

export const getLeadsContent = createAsyncThunk("/leads/content", async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_SERVER_URL+"pupils");
      return response?.data
    } catch (error) {
      console.error("Error fetching leads content:", error);
      throw error;
    }
  });
export const leadsSlice = createSlice({
    name: 'leads',
    initialState: {
        isLoading: false,
        leads : []
    },
    reducers: {


        addNewLead: (state, action) => {
            let {newLeadObj} = action.payload
            state.leads = [...state.leads, newLeadObj]
        },

        deleteLead: (state, action) => {
            let {index} = action.payload
            state.leads.splice(index, 1)
        }
    },

    extraReducers: {
		[getLeadsContent.pending]: state => {
			state.isLoading = true
		},
		[getLeadsContent.fulfilled]: (state, action) => {
            console.log( action.payload);
			state.leads = action.payload
			state.isLoading = false
		},
		[getLeadsContent.rejected]: state => {
			state.isLoading = false
		},
    }
})

export const { addNewLead, deleteLead } = leadsSlice.actions

export default leadsSlice.reducer