import { createSlice } from '@reduxjs/toolkit';

// ── Mock user seeded from .env (no login required) ────────────────────────────
const MOCK_USER = {
  id:              import.meta.env.VITE_MOCK_USER_ID  ?? '',
  organization_id: import.meta.env.VITE_MOCK_ORG_ID   ?? '',
  name:            import.meta.env.VITE_MOCK_USER_NAME ?? 'Admin User',
  email:           import.meta.env.VITE_MOCK_USER_EMAIL ?? 'admin@example.com',
  role:            import.meta.env.VITE_MOCK_USER_ROLE  ?? 'admin',
};

const initialState = {
  user:            MOCK_USER,
  token:           'mock-token',   // backend doesn't require auth token yet
  isAuthenticated: true,
  loading:         false,
  error:           null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Logout just resets back to the mock state (keeps app functional)
    logout(state) {
      state.user            = MOCK_USER;
      state.token           = 'mock-token';
      state.isAuthenticated = true;
      state.error           = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
