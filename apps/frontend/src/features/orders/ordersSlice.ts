import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface OrdersState {
    ordersID: number;
    ordersNumber: string;
}

const initialState: OrdersState = {
    ordersID: -1,
    ordersNumber: "",
}

export const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        setActiveOrdersID: (state, action: PayloadAction<number>) => {
            state.ordersID = action.payload
        },
        setActiveOrdersNumber: (state, action: PayloadAction<string>) => {
            state.ordersNumber = action.payload
        },
    },
});

// Action creators are generated for each case reducer function
export const { setActiveOrdersID, setActiveOrdersNumber } = ordersSlice.actions

export default ordersSlice.reducer
