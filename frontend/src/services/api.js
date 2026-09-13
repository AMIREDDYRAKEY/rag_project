


// ============================================================================
// BASE URL
// ============================================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://rag-project-ewtu.onrender.com";

const BASE_URL = API_URL.replace(/\/+$/, "");


// ============================================================================
// COMMON RESPONSE HANDLER
// ============================================================================

const handleResponse = async (response, defaultMessage) => {
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    console.error("API Error:", {
      status: response.status,
      statusText: response.statusText,
      data,
    });

    // FastAPI 422 validation error
    if (response.status === 422 && Array.isArray(data.detail)) {
      const errors = data.detail
        .map((error) => {
          const location = error.loc
            ? error.loc.join(" → ")
            : "request";

          return `${location}: ${error.msg}`;
        })
        .join("\n");

      throw new Error(`Validation error:\n${errors}`);
    }

    throw new Error(
      data.detail ||
      data.message ||
      defaultMessage
    );
  }

  return data;
};


// ============================================================================
// ASK QUESTION / RAG
// POST /ask/
// ============================================================================

export const askQuestion = async ({
  question,
  organization_id,
  user_id,
  top_k = 3,
}) => {
  if (!question || !question.trim()) {
    throw new Error("Question is required");
  }

  if (!organization_id) {
    throw new Error("Organization ID is required");
  }

  if (!user_id) {
    throw new Error("User ID is required");
  }

  const response = await fetch(`${BASE_URL}/ask/`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      question: question.trim(),
      organization_id: String(organization_id),
      user_id: String(user_id),
      top_k: Number(top_k),
    }),
  });

  return handleResponse(
    response,
    "Failed to get answer"
  );
};


// ============================================================================
// SEMANTIC SEARCH
// GET /search/
// ============================================================================

export const searchDocuments = async ({
  query,
  organization_id,
  user_id,
  top_k = 5,
}) => {
  if (!query || !query.trim()) {
    throw new Error("Search query is required");
  }

  if (!organization_id) {
    throw new Error("Organization ID is required");
  }

  if (!user_id) {
    throw new Error("User ID is required");
  }

  const params = new URLSearchParams({
    query: query.trim(),
    organization_id: String(organization_id),
    user_id: String(user_id),
    top_k: String(top_k),
  });

  const response = await fetch(
    `${BASE_URL}/search/?${params.toString()}`
  );

  return handleResponse(
    response,
    "Search failed"
  );
};


// ============================================================================
// UPLOAD DOCUMENT
// POST /documents/upload
//
// FastAPI expects:
//
// Header:
// organization-id: UUID
// owner-id: UUID
//
// Form Data:
// file
// ============================================================================

export const uploadDocumentApi = async ({
  file,
  organization_id,
  owner_id,
}) => {
  console.log("========== UPLOAD DEBUG ==========");
  console.log("File:", file?.name);
  console.log("Organization ID:", organization_id);
  console.log("Owner ID:", owner_id);
  console.log("==================================");

  if (!file) {
    throw new Error("No file selected");
  }

  if (!organization_id) {
    throw new Error("Organization ID is missing");
  }

  if (!owner_id) {
    throw new Error("Owner ID is missing");
  }

  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${BASE_URL}/documents/upload`,
    {
      method: "POST",

      headers: {
        "organization-id": String(organization_id),
        "owner-id": String(owner_id),
      },

      body: formData,
    }
  );

  const data = await response.json().catch(() => ({}));

  console.log("Upload status:", response.status);
  console.log("Upload response:", data);

  if (!response.ok) {
    if (response.status === 422 && Array.isArray(data.detail)) {
      const message = data.detail
        .map((error) => {
          const location = error.loc?.join(" → ");
          return `${location}: ${error.msg}`;
        })
        .join("\n");

      throw new Error(message);
    }

    throw new Error(data.detail || "Upload failed");
  }

  return data;
};


// ============================================================================
// FETCH DOCUMENTS
// GET /documents/?organization_id=...
// ============================================================================

export const fetchDocumentsApi = async ({
  organization_id,
}) => {

  if (!organization_id) {
    console.error(
      "fetchDocumentsApi: Organization ID missing"
    );

    return [];
  }

  try {

    const params = new URLSearchParams({
      organization_id: String(organization_id),
    });


    const response = await fetch(
      `${BASE_URL}/documents/?${params.toString()}`
    );


    if (!response.ok) {

      console.error(
        "Failed to fetch documents:",
        response.status
      );

      return [];
    }


    const data = await response.json();


    // Backend currently returns:
    //
    // [
    //   {
    //     id,
    //     name,
    //     size,
    //     status,
    //     uploaded_at,
    //     content_type
    //   }
    // ]

    if (Array.isArray(data)) {
      return data;
    }


    // Also support:
    //
    // {
    //   documents: [...]
    // }

    if (Array.isArray(data.documents)) {
      return data.documents;
    }


    return [];

  } catch (error) {

    console.error(
      "Fetch documents error:",
      error
    );

    return [];
  }
};


// ============================================================================
// DELETE DOCUMENT
// DELETE /documents/{document_id}
// ============================================================================

export const deleteDocumentApi = async ({
  document_id,
}) => {

  if (!document_id) {
    throw new Error(
      "Document ID is required"
    );
  }


  const response = await fetch(
    `${BASE_URL}/documents/${encodeURIComponent(
      document_id
    )}`,
    {
      method: "DELETE",
    }
  );


  return handleResponse(
    response,
    "Failed to delete document"
  );
};


// ============================================================================
// BACKEND HEALTH
// GET /health
// ============================================================================

export const checkHealthApi = async () => {

  const response = await fetch(
    `${BASE_URL}/health`
  );


  return handleResponse(
    response,
    "Backend is not available"
  );
};


// ============================================================================
// DATABASE HEALTH
// GET /health/database
// ============================================================================

export const checkDatabaseHealthApi = async () => {

  const response = await fetch(
    `${BASE_URL}/health/database`
  );


  return handleResponse(
    response,
    "Database connection failed"
  );
};


// ============================================================================
// EXPORT BASE URL
// ============================================================================

export { BASE_URL };
