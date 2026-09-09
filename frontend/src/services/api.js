const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

// ── Ask (RAG) ─────────────────────────────────────────────────────────────────
// POST /ask/  →  { question, organization_id, user_id, top_k }
// Response    →  { question, answer, sources: [{ chunk_id, document_id, document_name, chunk_index, distance }] }

export const askQuestion = async ({ question, organization_id, user_id, top_k = 3 }) => {
  const response = await fetch(`${API_URL}/ask/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, organization_id, user_id, top_k }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail ?? 'Failed to get answer');
  }
  return response.json();
};

// ── Semantic Search ───────────────────────────────────────────────────────────
// GET /search/?query=...&organization_id=...&user_id=...&top_k=3
// Response → { query, organization_id, user_id, results: [{ chunk_id, document_id, chunk_index, content, distance }] }

export const searchDocuments = async ({ query, organization_id, user_id, top_k = 5 }) => {
  const params = new URLSearchParams({ query, organization_id, user_id, top_k });
  const response = await fetch(`${API_URL}/search/?${params}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail ?? 'Search failed');
  }
  return response.json();
};

// ── Upload Document ───────────────────────────────────────────────────────────
// POST /documents/upload
// Headers: organization-id, owner-id
// Body:    multipart/form-data  { file }
// Response → { message, filename, organization_id, owner_id }

export const uploadDocumentApi = async ({ file, organization_id, owner_id }) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/documents/upload`, {
    method: 'POST',
    headers: {
      'organization-id': organization_id,
      'owner-id':        owner_id,
    },
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail ?? 'Upload failed');
  }
  return response.json();
};

// ── Fetch Documents ───────────────────────────────────────────────────────────
// GET /documents/?organization_id=...

export const fetchDocumentsApi = async ({ organization_id }) => {
  try {
    const params = new URLSearchParams({ organization_id });
    const response = await fetch(`${API_URL}/documents/?${params}`);
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
};

// ── Delete Document ───────────────────────────────────────────────────────────
// DELETE /documents/{document_id}

export const deleteDocumentApi = async ({ document_id }) => {
  const response = await fetch(`${API_URL}/documents/${document_id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail ?? 'Failed to delete document');
  }
  return response.json();
};