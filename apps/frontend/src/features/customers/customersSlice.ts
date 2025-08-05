import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface CustomersState {
    customerID: number;
    customerActiveTab: string;
}

const initialState: CustomersState = {
    customerID: -1,
    customerActiveTab: ""
}

export const customersSlice = createSlice({
    name: 'customers',
    initialState,
    reducers: {
        setActiveCustomerID: (state, action: PayloadAction<number>) => {
            state.customerID = action.payload
        },
        setActiveCustomerTab: (state, action: PayloadAction<string>) => {
            state.customerActiveTab = action.payload
        },
    },
});

// Action creators are generated for each case reducer function
export const { setActiveCustomerID, setActiveCustomerTab } = customersSlice.actions

export default customersSlice.reducer
