import { useNavigate } from 'react-router-dom'

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FEFEFE] px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#BB243E] mb-4">404</h1>
        <p className="text-xl text-[#111827] mb-2">Page Not Found</p>
        <p className="text-[#6B7280] mb-8">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-[#BB243E]/30 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 text-sm bg-[#BB243E] text-white hover:brightness-95"
        >
          Go Home
        </button>
      </div>
    </div>
  )
}
