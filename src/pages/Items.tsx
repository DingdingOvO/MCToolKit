import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import type { Item } from '../types'
import { useLang } from '../components/LangContext'
import { t } from '../i18n'

/* IntersectionObserver stagger — same pattern as Blocks */
function useStaggerReveal(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState<Set<string>>(new Set())
  const counter = useRef(0)
  const pending = useRef<HTMLElement[]>([])

  useEffect(() => {
    if (!ref.current) return
    setVisible(new Set())
    counter.current = 0
    pending.current = []

    let batchRaf = 0
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            pending.current.push(entry.target as HTMLElement)
            observer.unobserve(entry.target as Element)
          }
        }
        if (pending.current.length > 0 && !batchRaf) {
          batchRaf = requestAnimationFrame(() => {
            const batch = pending.current.splice(0)
            batchRaf = 0
            const next = new Set(visible)
            for (const el of batch) {
              const idx = counter.current++
              el.style.transitionDelay = `${Math.min(idx * 3, 800)}ms`
              next.add(el.dataset.id!)
            }
            setVisible(next)
          })
        }
      },
      { rootMargin: '200px 0px', threshold: 0 }
    )

    const items = ref.current.querySelectorAll<HTMLElement>('[data-id]')
    items.forEach(el => observer.observe(el))

    return () => {
      observer.disconnect()
      if (batchRaf) cancelAnimationFrame(batchRaf)
    }
  }, [dep])

  return { containerRef: ref, visible }
}

export default function Items() {
  const { lang } = useLang()
  const s = t(lang)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Item | null>(null)
  const [items, setItems] = useState<Item[]>([])

  useMemo(() => {
    import('../data/items.json').then(m => setItems(m.default as Item[]))
  }, [])

  const filtered = useMemo(() => {
    if (!items.length) return []
    if (!search.trim()) return items
    const q = search.toLowerCase().trim()
    return items.filter(item =>
      item.id.includes(q) ||
      Object.values(item.name).some(n => n.toLowerCase().includes(q))
    )
  }, [search, items])

  const dl = useCallback((item: Item) => {
    const a = document.createElement('a')
    a.href = `/MCToolKit/textures/${item.texture}`
    a.download = `${item.id}.png`
    a.click()
  }, [])

  const { containerRef, visible } = useStaggerReveal(search)

  return (
    <div className='max-w-5xl mx-auto px-5 py-4'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='relative flex-1 max-w-sm'>
          <svg className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
          </svg>
          <input
            type='text'
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={s.searchPlaceholder}
            className='w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-300 transition-colors'
          />
        </div>
        <span className='text-xs text-gray-300 tabular-nums'>
          {s.itemCount.replace('{count}', String(filtered.length)).replace('{total}', String(items.length || 0))}
        </span>
        {search && filtered.length > 0 && (
          <button
            onClick={() => filtered.forEach((item, i) => setTimeout(() => dl(item), i * 80))}
            className='px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors'
          >
            {s.downloadAll}
          </button>
        )}
      </div>

      {!items.length ? (
        <div className='text-center py-20 text-sm text-gray-300'>...</div>
      ) : (
        <div ref={containerRef} className='grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-1'>
          {filtered.map(item => {
            const show = visible.has(item.id)
            return (
              <button
                key={item.id}
                data-id={item.id}
                onClick={() => setSelected(selected?.id === item.id ? null : item)}
                className={`stagger-cell flex flex-col items-center gap-0.5 p-1 rounded-lg transition-colors hover:bg-gray-100 ${
                  selected?.id === item.id ? 'bg-gray-100 ring-1 ring-blue-400' : ''
                } ${show ? 'stagger-visible' : ''}`}
              >
                <img
                  src={`/MCToolKit/textures/${item.texture}`}
                  alt={item.name[lang]}
                  className='item-icon w-10 h-10'
                  loading='lazy'
                />
                <span className='text-[9px] text-gray-400 leading-tight text-center line-clamp-2 w-full'>
                  {item.name[lang]}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {selected && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm' onClick={() => setSelected(null)}>
          <div className='bg-white rounded-xl border border-gray-200 p-5 w-64 shadow-xl' onClick={e => e.stopPropagation()}>
            <div className='flex gap-3 mb-4'>
              <div className='w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center shrink-0'>
                <img src={`/MCToolKit/textures/${selected.texture}`} alt='' className='item-icon w-10 h-10' />
              </div>
              <div className='min-w-0'>
                <h3 className='text-sm font-semibold text-gray-900 truncate'>{selected.name[lang]}</h3>
                <p className='text-[11px] text-gray-300 font-mono mt-0.5'>{selected.id}</p>
              </div>
            </div>
            <div className='flex gap-2'>
              <button onClick={() => dl(selected)} className='flex-1 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors'>
                {s.downloadTexture}
              </button>
              <button onClick={() => setSelected(null)} className='px-3 py-1.5 text-xs text-gray-400 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'>
                {s.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}