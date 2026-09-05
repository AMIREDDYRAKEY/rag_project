import { Link } from 'react-router-dom'
import { useUser, useDocuments, useChatMessages } from '../store/hooks'

const StatCard = ({ label, value, sub, color, icon }) => (
  <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg ${color}`}>
        {icon}
      </div>
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
)

const recentActivity = [
  { action: 'Document uploaded', detail: 'Q3_Report.pdf', time: '2m ago', color: 'bg-teal-100 text-teal-600' },
  { action: 'Question asked', detail: 'What is our revenue forecast?', time: '15m ago', color: 'bg-blue-100 text-blue-600' },
  { action: 'Document uploaded', detail: 'Policy_2024.docx', time: '1h ago', color: 'bg-purple-100 text-purple-600' },
  { action: 'Question asked', detail: 'Summarise the compliance docs', time: '3h ago', color: 'bg-orange-100 text-orange-600' },
  { action: 'New session started', detail: 'Chat session #14', time: '5h ago', color: 'bg-pink-100 text-pink-600' },
]

export default function Dashboard() {
  const user = useUser()
  const { documents } = useDocuments()
  const messages = useChatMessages()

  const stats = [
    {
      label: 'Total Documents',
      value: documents.length,
      sub: 'In your knowledge base',
      color: 'bg-gradient-to-br from-teal-400 to-teal-600',
      icon: '📄',
    },
    {
      label: 'Questions Asked',
      value: messages.filter(m => m.role === 'user').length,
      sub: 'This session',
      color: 'bg-gradient-to-br from-blue-400 to-blue-600',
      icon: '💬',
    },
    {
      label: 'Avg. Response',
      value: '1.2s',
      sub: 'Average latency',
      color: 'bg-gradient-to-br from-violet-400 to-violet-600',
      icon: '⚡',
    },
    {
      label: 'Accuracy Score',
      value: '9.4',
      sub: 'Out of 10',
      color: 'bg-gradient-to-br from-orange-400 to-orange-500',
      icon: '🎯',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/chat"
            className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-200 hover:shadow-lg hover:shadow-teal-200 transition-all">
            New Chat
          </Link>
          <Link to="/documents"
            className="px-4 py-2 text-sm font-medium rounded-xl bg-white/70 border border-white/80 text-gray-600 hover:bg-white transition-all">
            View Documents
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-3 gap-4">

        {/* Recent Activity - wide */}
        <div className="col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-800">Recent Activity</h3>
            <span className="text-xs text-teal-500 font-medium cursor-pointer hover:underline">View all</span>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/60 transition-colors">
                <div className={`w-2 h-2 rounded-full ${item.color.split(' ')[0]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">{item.action}</p>
                  <p className="text-xs text-gray-400 truncate">{item.detail}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${item.color}`}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Organization card */}
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Organization</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                {user?.organization_id?.[0]?.toUpperCase() ?? 'O'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{user?.organization_id ?? 'My Org'}</p>
                <p className="text-xs text-gray-400">{user?.role ?? 'User'}</p>
              </div>
            </div>
          </div>

          {/* Quick tip card */}
          <div className="rounded-2xl p-5 text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' }}>
            {/* decorative blobs */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full bg-white/10" />
            <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-2">Pro Tip</p>
            <p className="text-sm font-semibold leading-snug relative z-10">
              Upload more documents to improve answer accuracy
            </p>
            <Link to="/documents"
              className="mt-4 inline-block text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
              Upload Now →
            </Link>
          </div>

          {/* Start chat card */}
          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Ask anything</p>
              <p className="text-xs text-gray-400 mt-0.5">Powered by RAG</p>
            </div>
            <Link to="/chat"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-colors shadow-md shadow-teal-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
