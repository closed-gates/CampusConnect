import { useEffect, useState } from 'react'

/**
 * useSidebarController – open/close state for the phone navigation sheet.
 *
 * MVC Role: Controller (hook)
 *
 * Below 900px the sidebar folds into a top bar; this hook owns whether the
 * full-screen nav sheet is open and closes it on Escape.
 */
export function useSidebarController() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return {
    menuOpen,
    toggleMenu: () => setMenuOpen(open => !open),
    closeMenu: () => setMenuOpen(false),
  }
}
