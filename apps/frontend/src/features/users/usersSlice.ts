import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Define the role enum
export enum UserRole {
    ADMIN = 'ADMIN',
    EMPLOYEE = 'EMPLOYEE'
}


export interface UsersState {
    cognitoId: string;
    email: string;
    firstname: string;
    fullname: string;
    lastname: string;
    role: UserRole;
    username: string;
}

const initialState: UsersState = {
    cognitoId: '',
    email: '',
    firstname: '',
    fullname: '',
    lastname: '',
    role: UserRole.EMPLOYEE, // Default role
    username: ''
}

export const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UsersState>) => {
            return { ...state, ...action.payload }
        },
        clearUser: (state) => {
            return initialState
        },
    },
});

// Action creators are generated for each case reducer function
export const { setUser, clearUser } = usersSlice.actions

export default usersSlice.reducer
