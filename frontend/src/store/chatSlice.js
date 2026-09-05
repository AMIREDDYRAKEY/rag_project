import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { askQuestion } from '../services/api';

const initialState = {
  messages: [],   // { id, role: 'user'|'assistant', content, sources, timestamp }
  loading: false,
  error: null,
};

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ question, organization_id, user_id, top_k = 3 }, { rejectWithValue }) => {
    try {
      const data = await askQuestion({ question, organization_id, user_id, top_k });
      return { answer: data.answer, sources: data.sources ?? [] };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addUserMessage(state, action) {
      state.messages.push({
        id: `user-${Date.now()}`,
        role: 'user',
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    clearChat(state) {
      state.messages = [];
      state.error = null;
    },
    clearChatError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push({
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: action.payload.answer,
          sources: action.payload.sources,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addUserMessage, clearChat, clearChatError } = chatSlice.actions;
export default chatSlice.reducer;
