import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useLang } from './LangContext'
import { t, LANG_OPTIONS } from '../i18n'

const NAV_ITEMS = [
  { to: '/', labelKey: 'home' as const, end: true },
  { to: '/items', labelKey: 'items' as const },
  { to: '/blocks', labelKey: 'blocks' as const },
  { to: '/sounds', labelKey: 'sounds' as const },
]

export default function Layout() {
  const { lang, setLang } = useLang()
  const s = t(lang)
  const [langOpen, setLangOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const currentLabel = LANG_OPTIONS.find(o => o.code === lang)?.label ?? lang

  return (
    <div className='min-h-screen bg-gray-50 text-gray-900 flex flex-col'>
      {/* Header */}
      <header className='sticky top-0 z-50 bg-white border-b border-gray-200'>
        <div className='max-w-6xl mx-auto px-4 h-12 flex items-center gap-6'>
          <NavLink to='/' className='text-lg font-bold text-gray-900 whitespace-nowrap hover:text-gray-600 transition-colors'>
            {s.siteName}
          </NavLink>
          <nav className='flex gap-1'>
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-sm rounded-md transition-colors ${
                    isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                {s[item.labelKey]}
              </NavLink>
            ))}
          </nav>
          <div className='flex-1' />
          {/* Language Menu */}
          <div ref={menuRef} className='relative'>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className='flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 21a9 9 0 100-18 9 9 0 000 18zm0-18c-2.5 4.5-2.5 8 0 9m0-9c2.5 4.5 2.5 8 0 9m9-9a9 9 0 00-9-9m9 9c-4.5-2.5-8-2.5-9 0m-9-9a9 9 0 019 9m-9-9c4.5 2.5 8 2.5 9 0' />
              </svg>
              <span>{currentLabel}</span>
              <svg className={`w-3.5 h-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
              </svg>
            </button>
            {langOpen && (
              <div className='absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50'>
                {LANG_OPTIONS.map(opt => (
                  <button
                    key={opt.code}
                    onClick={() => { setLang(opt.code); setLangOpen(false) }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      lang === opt.code ? 'text-blue-600 bg-blue-50 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className='flex-1'>
        <Outlet />
      </main>
    </div>
  )
}
