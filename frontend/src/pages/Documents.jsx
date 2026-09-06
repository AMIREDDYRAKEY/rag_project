import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { fetchDocuments, uploadDocument, deleteDocument } from '../store/documentsSlice'
import { useDocuments, useUser } from '../store/hooks'

export default function Documents() {
  const dispatch = useDispatch()
  const { documents, loading, uploading, error } = useDocuments()
  const user = useUser()
  const fileRef = useRef()

  useEffect(() => {
    if (user?.organization_id) {
      dispatch(fetchDocuments({ organization_id: user.organization_id }))
    }
  }, [dispatch, user])

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    dispatch(uploadDocument({
      file,
      organization_id: user.organization_id,
      owner_id: user.id,
    }))
    e.target.value = ''
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Documents</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your organization's knowledge base</p>
        </div>
        <button
          onClick={() => fileRef.current.click()}
          disabled={uploading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md shadow-teal-200 hover:shadow-lg disabled:opacity-50 transition-all"
          style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={handleUpload}
          accept=".pdf,.txt,.docx,.md" />
      </div>

      {/* Upload success banner */}
      {uploading && (
        <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 text-teal-700 text-sm px-4 py-3 rounded-xl">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Uploading document to backend...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-500 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {/* Content */}
      <div className="glass-card rounded-2xl p-6">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">No documents yet</p>
            <p className="text-xs text-gray-400 mt-1">Upload your first document to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table header — desktop only */}
            <div className="hidden sm:grid grid-cols-12 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
              <span className="col-span-5">Name</span>
              <span className="col-span-2">Size</span>
              <span className="col-span-3">Uploaded</span>
              <span className="col-span-1">Status</span>
              <span className="col-span-1" />
            </div>
            {documents.map((doc, i) => (
              <div key={doc.id}
                className={`rounded-xl text-sm transition-colors hover:bg-white/60 ${i % 2 === 0 ? 'bg-white/30' : ''}`}>

                {/* Desktop row */}
                <div className="hidden sm:grid grid-cols-12 items-center px-4 py-3">
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-700 truncate">{doc.name}</span>
                  </div>
                  <span className="col-span-2 text-gray-400">
                    {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : '—'}
                  </span>
                  <span className="col-span-3 text-gray-400">
                    {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '—'}
                  </span>
                  <span className="col-span-1">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                      doc.status === 'uploaded' ? 'bg-teal-100 text-teal-600' :
                      doc.status === 'processing' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {doc.status ?? 'Ready'}
                    </span>
                  </span>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => dispatch(deleteDocument({ document_id: doc.id }))}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Mobile card */}
                <div className="sm:hidden flex items-start gap-3 px-3 py-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-700 truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400">
                        {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : '—'}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">
                        {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '—'}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                        doc.status === 'uploaded' ? 'bg-teal-100 text-teal-600' :
                        doc.status === 'processing' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {doc.status ?? 'Ready'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch(deleteDocument({ document_id: doc.id }))}
                    className="text-gray-400 hover:text-red-400 transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
