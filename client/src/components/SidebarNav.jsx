import { Brand } from './Brand'
import { NavItem } from './NavItem'
import { navItems } from '../config/routes'


export function SidebarNav() {
  return (
    <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col md:bg-[#f3c7c6b7]">
      <div className="bg-[#BB243E] px-5 py-6">
        <Brand />
      </div>

      <nav className="flex flex-1 flex-col gap-2 px-4 py-4">
        {navItems.map((item) => (
          <NavItem key={item.to} to={item.to} label={item.label} />
        ))}
      </nav>
      
      <div className="border-t border-[rgba(17,24,39,0.12)] px-5 py-5 text-xs text-[#6B7280]">
        Team X-Force | &copy; 2026 Cavista Inc. All rights reserved.
      </div>
    </aside>
  )
}

