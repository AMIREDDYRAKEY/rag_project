import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../store/authSlice'
import { useUser } from '../store/hooks'

export default function Profile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useUser()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const details = [
    { label: 'Full Name',       value: user?.name },
    { label: 'Email',           value: user?.email },
    { label: 'Role',            value: user?.role },
    { label: 'Organization ID', value: user?.organization_id },
    { label: 'User ID',         value: user?.id },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your account details</p>
      </div>

      {/* Avatar card */}
      <div className="glass-card rounded-2xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-teal-200 flex-shrink-0">
          {user?.name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">{user?.name ?? '—'}</h2>
          <p className="text-sm text-gray-400">{user?.email ?? '—'}</p>
          <span className="mt-1 inline-block text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-100 text-teal-600 capitalize">
            {user?.role ?? 'user'}
          </span>
        </div>
      </div>

      {/* Details card */}
      <div className="glass-card rounded-2xl p-6 space-y-1">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Account Details</h3>
        {details.map((d) => (
          <div key={d.label} className="flex items-center justify-between py-3 border-b border-white/60 last:border-0">
            <span className="text-sm text-gray-400">{d.label}</span>
            <span className="text-sm font-medium text-gray-700">{d.value ?? '—'}</span>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sign Out
      </button>
    </div>
  )
}
