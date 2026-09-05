import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../store/authSlice'
import { useAuth } from '../store/hooks'

const fields = [
  { label: 'Full Name',        name: 'name',            type: 'text',     placeholder: 'John Doe' },
  { label: 'Email',            name: 'email',           type: 'email',    placeholder: 'you@company.com' },
  { label: 'Password',         name: 'password',        type: 'password', placeholder: '••••••••' },
  { label: 'Organization ID',  name: 'organization_id', type: 'text',     placeholder: 'org-123' },
]

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', organization_id: '' })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(registerUser(form))
    if (registerUser.fulfilled.match(result)) navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 50%, #ede9fe 100%)' }}>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-200 mb-4">
            <span className="text-white text-2xl font-bold">R</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Join your enterprise workspace</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="text-sm font-medium text-gray-600 block mb-1.5">{f.label}</label>
                <input
                  name={f.name} type={f.type} required
                  value={form[f.name]} onChange={handleChange}
                  placeholder={f.placeholder}
                  className="w-full bg-white/60 border border-white/80 text-gray-700 placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-300 transition-all"
                />
              </div>
            ))}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-500 text-sm px-4 py-2.5 rounded-xl">{error}</div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-md shadow-teal-200 hover:shadow-lg disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-500 font-medium hover:text-teal-600">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
