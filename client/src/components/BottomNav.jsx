import { useState } from 'react'
import { navItems } from '../config/routes'
import { NavItem } from './NavItem'

/**
 * Mobile Bottom Navigation
 * 
 * Features:
 * - Shows main nav items in scrollable tabs on mobile
 * - Includes "More" button to access additional options
 * - Smooth scrolling and responsive design
 */
export function BottomNav() {
  const [showMore, setShowMore] = useState(false)
  const visibleItems = navItems.slice(0, 2) // Show first 2 items, rest in "More"
  const moreItems = navItems.slice(2)

  return (
    <>
      {/* Bottom Navigation - Main Tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[rgba(17,24,39,0.12)] bg-[#FEFEFE]/95 px-3 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex gap-2 overflow-x-auto scrollbar-hide">
          {/* Visible Items */}
          {visibleItems.map((item) => (
            <div key={item.to} className="shrink-0">
              <NavItem to={item.to} label={item.label} />
            </div>
          ))}

          {/* More Button */}
          {moreItems.length > 0 && (
            <button
              onClick={() => setShowMore(!showMore)}
              className="shrink-0 inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition text-[#111827] hover:bg-[rgba(187,36,62,0.1)]"
            >
              ⋯ More
            </button>
          )}
        </div>
      </nav>

      {/* More Menu - Modal/Drawer */}
      {showMore && moreItems.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setShowMore(false)}
          />

          {/* Menu Content */}
          <div className="relative w-full rounded-t-2xl border-t border-[rgba(17,24,39,0.12)] bg-[#FEFEFE] p-4 animate-in slide-in-from-bottom">
            <div className="mb-4 text-center">
              <h3 className="text-sm font-semibold text-[#111827]">More Options</h3>
            </div>

            <div className="space-y-2">
              {moreItems.map((item) => (
                <a
                  key={item.to}
                  href={item.to}
                  onClick={(e) => {
                    e.preventDefault()
                    window.location.hash = item.to
                    setShowMore(false)
                  }}
                  className="block rounded-xl border border-[rgba(17,24,39,0.12)] px-4 py-3 text-center text-sm font-medium text-[#111827] transition hover:bg-[#f3f4f6]"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <button
              onClick={() => setShowMore(false)}
              className="mt-4 w-full rounded-xl bg-[#f3f4f6] px-4 py-3 text-center text-sm font-medium text-[#111827] transition hover:bg-[#e5e7eb]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}

