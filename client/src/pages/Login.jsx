import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle login logic here
    navigate('/')
  }

  const handleNotNow = () => {
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FEFEFE] px-4">
      <div className="rounded-2xl border border-[rgba(17,24,39,0.12)] bg-[#FEFEFE] shadow-soft w-full max-w-md">
        <div className="space-y-6 p-6">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">Login</h1>
            <p className="text-sm text-[#6B7280]">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-[rgba(17,24,39,0.12)] bg-[#FEFEFE] px-3 text-sm outline-none transition placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#BB243E]/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-[rgba(17,24,39,0.12)] bg-[#FEFEFE] px-3 text-sm outline-none transition placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#BB243E]/30"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-[#BB243E]/30 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 text-sm bg-[#BB243E] text-white hover:brightness-95"
            >
              Sign In
            </button>
            
            <button
              type="button"
              onClick={handleNotNow}
              className="w-full inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-[#6B7280]/30 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 text-sm bg-transparent border border-[rgba(17,24,39,0.12)] text-[#111827] hover:bg-[#f3f4f6]"
            >
              Not Now
            </button>
          </form>

          <div className="text-center text-sm text-[#6B7280]">
            Don't have an account?{' '}
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-[#BB243E] hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
