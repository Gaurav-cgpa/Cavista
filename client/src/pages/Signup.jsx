import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export function Signup() {
  const [username, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    // Handle signup logic here
    setError('')
    fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'Signup failed');
          return;
        }
        navigate('/');
      })
      .catch(() => {
        setError('Network error, please try again');
      });
  }

  const handleNotNow = () => {
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FEFEFE] px-4">
      <div className="rounded-2xl border border-[rgba(17,24,39,0.12)] bg-[#FEFEFE] shadow-soft w-full max-w-md">
        <div className="space-y-6 p-6">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">Sign Up</h1>
            <p className="text-sm text-[#6B7280]">Create a new account</p>
          </div>

          {error && (
            <div className="rounded-lg bg-[#BB243E]/10 border border-[#BB243E]/20 p-3 text-sm text-[#BB243E]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={username}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-[rgba(17,24,39,0.12)] bg-[#FEFEFE] px-3 text-sm outline-none transition placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#BB243E]/30"
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-[rgba(17,24,39,0.12)] bg-[#FEFEFE] px-3 text-sm outline-none transition placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#BB243E]/30"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-[#BB243E]/30 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 text-sm bg-[#BB243E] text-white hover:brightness-95"
            >
              Create Account
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
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-[#BB243E] hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
