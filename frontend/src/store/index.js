import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import chatReducer from './chatSlice';
import documentsReducer from './documentsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    documents: documentsReducer,
  },
});

export default store;
