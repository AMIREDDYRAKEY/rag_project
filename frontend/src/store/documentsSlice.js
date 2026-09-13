import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchDocumentsApi, uploadDocumentApi, deleteDocumentApi } from '../services/api';

const initialState = {
  documents: [],   // { id, name, size, status, uploaded_at, organization_id }
  loading:   false,
  uploading: false,
  error:     null,
};

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchDocuments = createAsyncThunk(
  'documents/fetchAll',
  async ({ organization_id }, { rejectWithValue }) => {
    try {
      return await fetchDocumentsApi({ organization_id });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'documents/uploadDocument',
  async ({ file, organization_id, owner_id }, { rejectWithValue }) => {
    try {
      console.log("UPLOAD SLICE")
      console.log("file:", file?.name)
      console.log("organization_id:", organization_id)
      console.log("owner_id:", owner_id)

      const data = await uploadDocumentApi({
        file,
        organization_id,
        owner_id,
      })

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteDocument = createAsyncThunk(
  'documents/delete',
  async ({ document_id }, { rejectWithValue }) => {
    try {
      await deleteDocumentApi({ document_id });
      return document_id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearDocumentsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Upload
    builder
      .addCase(uploadDocument.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.uploading = false;
        state.documents.unshift(action.payload);
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      });

    // Delete (local only)
    builder
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter((d) => d.id !== action.payload);
      });
  },
});

export const { clearDocumentsError } = documentsSlice.actions;
export default documentsSlice.reducer;
