export const navItems = [
  { to: '/', label: 'Home' },
  { to: '/profile', label: 'Profile' },
  {to: '/login', label: 'Login' },
  { to: '/ai-assistance', label: 'AI Assistance' },
  {to : '/dashboard', label: 'Dashboard' },
]


export const publicRoutes = [
  { path: '/login', name: 'login' },
]

export const protectedRoutes = [
  { path: '/', name: 'home' },
  { path: '/home', name: 'home' },
  { path: '/profile', name: 'profile' },
  { path: '/ai-assistance', name: 'ai-assistance' },
  { path: '/dashboard', name: 'dashboard' },
]
