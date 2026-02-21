import { NavLink } from 'react-router-dom'

export function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center justify-center rounded-xl px-3 py-2 text-sm transition ${
          isActive ? 'bg-[#BB243E] text-white' : 'text-[#111827] hover:bg-[rgba(187,36,62,0.1)]'
        }`
      }
      end={to === '/'}
    >
      {label}
    </NavLink>
  )
}