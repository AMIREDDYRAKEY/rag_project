import { useState, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { addUserMessage, sendMessage, clearChat } from '../store/chatSlice'
import { useChat, useUser } from '../store/hooks'

export default function Chat() {
  const dispatch = useDispatch()
  const { messages, loading, error } = useChat()
  const user = useUser()
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    dispatch(addUserMessage(input.trim()))
    dispatch(sendMessage({
      question:        input.trim(),
      organization_id: user?.organization_id ?? '',
      user_id:         user?.id ?? '',
    }))
    setInput('')
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Chat</h1>
          <p className="text-sm text-gray-400 mt-0.5">Ask questions about your documents</p>
        </div>
        <button
          onClick={() => dispatch(clearChat())}
          className="self-end sm:self-auto text-sm px-4 py-2 rounded-xl bg-white/70 border border-white/80 text-gray-500 hover:bg-white transition-all"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 glass-card rounded-2xl p-5 overflow-y-auto space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">Start a conversation</p>
            <p className="text-xs text-gray-400 mt-1">Ask anything about your uploaded documents</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1 shadow-md shadow-teal-100">
                R
              </div>
            )}
            <div className={`max-w-[85%] sm:max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'text-white rounded-br-sm shadow-md shadow-teal-100'
                : 'bg-white/80 text-gray-700 rounded-bl-sm border border-white shadow-sm'
            }`}
              style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #14b8a6, #0d9488)' } : {}}>
              {/* Answer text only */}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 shadow-md shadow-teal-100">
              R
            </div>
            <div className="bg-white/80 border border-white px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center shadow-sm">
              {[0, 150, 300].map((delay) => (
                <span key={delay} className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}ms` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <p className="text-center text-red-400 text-sm bg-red-50 border border-red-100 px-4 py-2 rounded-xl">
              ⚠️ {error}
            </p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="glass-card rounded-2xl px-4 py-3 flex gap-3 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your documents..."
          className="flex-1 bg-transparent text-gray-700 placeholder-gray-400 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all shadow-md shadow-teal-100"
          style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Send
        </button>
      </form>
    </div>
  )
}
