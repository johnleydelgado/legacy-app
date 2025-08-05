// store/index.tsx
import { configureStore } from '@reduxjs/toolkit';
import customersReducer from '@/features/customers/customersSlice';
import quotesReducer from '@/features/quotes/quotesSlice';
import ordersReducer from '@/features/orders/ordersSlice';
import usersReducer from '@/features/users/usersSlice';

export const store = configureStore({
    reducer: {
        customers: customersReducer,
        quotes: quotesReducer,
        orders: ordersReducer,
        users: usersReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});


// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
