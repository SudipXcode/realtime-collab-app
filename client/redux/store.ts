import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage
import profileReducer from "./slices/profileSlice";
import payReducer from "./slices/paySlice";
import ListTile from "./slices/ListsTitlesSlice";
import listReducer from "./slices/ListSlice";
// Combine reducers
const rootReducer = combineReducers({
  profile: profileReducer,
  pay: payReducer,
  listTitle: ListTile,
  list: listReducer,
});

// Persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: [], // only persist ui slice
};

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
