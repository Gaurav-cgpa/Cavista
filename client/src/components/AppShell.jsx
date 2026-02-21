import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { SidebarNav } from './SidebarNav'

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#FEFEFE]">
      <SidebarNav />

      <main className="mx-auto min-h-screen max-w-5xl px-4 pb-24 pt-8 md:ml-64 md:px-10 md:pb-10">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}

