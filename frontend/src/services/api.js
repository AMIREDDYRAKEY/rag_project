 

const API_URL =
  import.meta.env.VITE_API_URL || "https://rag-project-ewtu.onrender.com";

// Remove accidental trailing slash
const BASE_URL = API_URL.replace(/\/+$/, "");

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Handle API response
// ─────────────────────────────────────────────────────────────────────────────
const handleResponse = async (response, defaultMessage) => {
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.detail || data.message || defaultMessage);
  }

  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// ASK QUESTION / RAG
// POST /ask/
//
// Request:
// {
//   question,
//   organization_id,
//   user_id,
//   top_k
// }
//
// Response:
// {
//   question,
//   answer,
//   sources: [
//     {
//       chunk_id,
//       document_id,
//       document_name,
//       chunk_index,
//       distance
//     }
//   ]
// }
// ─────────────────────────────────────────────────────────────────────────────
export const askQuestion = async ({
  question,
  organization_id,
  user_id,
  top_k = 3,
}) => {
  const response = await fetch(`${BASE_URL}/ask/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      organization_id,
      user_id,
      top_k,
    }),
  });

  return handleResponse(response, "Failed to get answer");
};

// ─────────────────────────────────────────────────────────────────────────────
// SEMANTIC SEARCH
// GET /search/
//
// Query:
// ?query=...
// &organization_id=...
// &user_id=...
// &top_k=5
// ─────────────────────────────────────────────────────────────────────────────
export const searchDocuments = async ({
  query,
  organization_id,
  user_id,
  top_k = 5,
}) => {
  const params = new URLSearchParams({
    query: String(query),
    organization_id: String(organization_id),
    user_id: String(user_id),
    top_k: String(top_k),
  });

  const response = await fetch(`${BASE_URL}/search/?${params.toString()}`);

  return handleResponse(response, "Search failed");
};

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD DOCUMENT
// POST /documents/upload
//
// Headers:
// organization-id
// owner-id
//
// Body:
// multipart/form-data
// file
// ─────────────────────────────────────────────────────────────────────────────
export const uploadDocumentApi = async ({
  file,
  organization_id,
  owner_id,
}) => {
  if (!file) {
    throw new Error("Please select a document");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/documents/upload`, {
    method: "POST",
    headers: {
      "organization-id": String(organization_id),
      "owner-id": String(owner_id),
    },
    body: formData,
  });

  return handleResponse(response, "Upload failed");
};

// ─────────────────────────────────────────────────────────────────────────────
// FETCH DOCUMENTS
// GET /documents/?organization_id=...
// ─────────────────────────────────────────────────────────────────────────────
export const fetchDocumentsApi = async ({ organization_id }) => {
  try {
    const params = new URLSearchParams({
      organization_id: String(organization_id),
    });

    const response = await fetch(
      `${BASE_URL}/documents/?${params.toString()}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Supports both:
// 1. [document1, document2]
// 2. { documents: [...] }
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data.documents)) {
      return data.documents;
    }

    return data;
  } catch (error) {
    console.error("Fetch documents error:", error);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE DOCUMENT
// DELETE /documents/{document_id}
// ─────────────────────────────────────────────────────────────────────────────
export const deleteDocumentApi = async ({ document_id }) => {
  if (!document_id) {
    throw new Error("Document ID is required");
  }

  const response = await fetch(
    `${BASE_URL}/documents/${encodeURIComponent(document_id)}`,
    {
      method: "DELETE",
    }
  );

  return handleResponse(response, "Failed to delete document");
};

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH CHECK
// GET /health
// ─────────────────────────────────────────────────────────────────────────────
export const checkHealthApi = async () => {
  const response = await fetch(`${BASE_URL}/health`);

  return handleResponse(response, "Backend is not available");
};

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE HEALTH CHECK
// GET /health/database
// ─────────────────────────────────────────────────────────────────────────────
export const checkDatabaseHealthApi = async () => {
  const response = await fetch(`${BASE_URL}/health/database`);

  return handleResponse(response, "Database connection failed");
};
 
