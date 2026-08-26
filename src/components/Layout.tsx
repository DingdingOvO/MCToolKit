import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, Outlet } from 'react-router-dom'
import { useLang } from './LangContext'
import { t, LANG_OPTIONS } from '../i18n'

type NavKey = 'home' | 'items' | 'blocks' | 'sounds'

const NAV: { to: string; key: NavKey; end?: boolean }[] = [
  { to: '/', key: 'home', end: true },
  { to: '/items', key: 'items' },
  { to: '/blocks', key: 'blocks' },
  { to: '/sounds', key: 'sounds' },
]

export default function Layout() {
  const { lang, setLang } = useLang()
  const s = t(lang)
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 })

  const updatePos = useCallback(() => {
    const rect = btnRef.current?.getBoundingClientRect()
    if (rect) {
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
  }, [])

  useEffect(() => {
    if (!open) return
    updatePos()
    const onScroll = () => updatePos()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', updatePos)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [open, updatePos])

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-lang-dropdown]') || target === btnRef.current) return
      setOpen(false)
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [open])

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      <header className='sticky top-0 bg-white border-b border-gray-200 z-50'>
        <div className='max-w-5xl mx-auto px-5 h-11 flex items-center'>
          <NavLink to='/' className='text-sm font-bold text-gray-900 mr-6 tracking-tight'>
            {s.siteName}
          </NavLink>
          <nav className='flex gap-0.5'>
            {NAV.map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `px-2.5 py-1 text-[13px] rounded-md transition-colors ${
                    isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-400 hover:text-gray-700'
                  }`
                }
              >
                {s[n.key]}
              </NavLink>
            ))}
          </nav>
          <div className='flex-1' />
          <button
            ref={btnRef}
            onClick={() => setOpen(o => !o)}
            className='flex items-center gap-1 px-2 py-1 text-[13px] text-gray-400 hover:text-gray-700 rounded-md transition-colors'
          >
            <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' />
            </svg>
            <span>{LANG_OPTIONS.find(o => o.code === lang)?.label}</span>
            <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
            </svg>
          </button>
        </div>
      </header>
      <main className='flex-1'><Outlet /></main>
      {open && createPortal(
        <div data-lang-dropdown style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}>
          <div className='py-1 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[140px]'>
            {LANG_OPTIONS.map(opt => (
              <button
                key={opt.code}
                onClick={(e) => { e.stopPropagation(); setLang(opt.code); setOpen(false) }}
                className={`w-full text-left px-3 py-1.5 text-[13px] transition-colors ${
                  lang === opt.code ? 'text-blue-600 bg-blue-50 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}