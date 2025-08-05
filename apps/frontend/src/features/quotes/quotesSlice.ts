import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface QuotesState {
    quotesID: number;
    quotesNumber: string;
}

const initialState: QuotesState = {
    quotesID: -1,
    quotesNumber: ""
}

export const quotesSlice = createSlice({
    name: 'quotes',
    initialState,
    reducers: {
        setActiveQuotesID: (state, action: PayloadAction<number>) => {
            state.quotesID = action.payload
        },
        setActiveQuotesNumber: (state, action: PayloadAction<string>) => {
            state.quotesNumber = action.payload
        },
    },
});

// Action creators are generated for each case reducer function
export const { setActiveQuotesID, setActiveQuotesNumber } = quotesSlice.actions

export default quotesSlice.reducer
