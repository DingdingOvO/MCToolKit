import { useState, useMemo, useCallback } from 'react'
import itemsData from '../data/items.json'
import type { Item } from '../types'
import { useLang } from '../components/LangContext'
import { t } from '../i18n'

const ITEMS: Item[] = itemsData as Item[]

export default function Items() {
  const { lang } = useLang()
  const s = t(lang)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Item | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return ITEMS
    const q = search.toLowerCase().trim()
    return ITEMS.filter(item =>
      item.id.includes(q) ||
      Object.values(item.name).some(n => n.toLowerCase().includes(q))
    )
  }, [search])

  const dl = useCallback((item: Item) => {
    const a = document.createElement('a')
    a.href = `/MCToolKit/textures/${item.texture}`
    a.download = `${item.id}.png`
    a.click()
  }, [])

  return (
    <div className='max-w-5xl mx-auto px-5 py-4'>
      {/* Toolbar */}
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
          {s.itemCount.replace('{count}', String(filtered.length)).replace('{total}', String(ITEMS.length))}
        </span>
        {search && (
          <button
            onClick={() => filtered.forEach((item, i) => setTimeout(() => dl(item), i * 80))}
            className='px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors'
          >
            {s.downloadAll}
          </button>
        )}
      </div>

      {/* Grid */}
      <div className='grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-1.5'>
        {filtered.map(item => (
          <button
            key={item.id}
            onClick={() => setSelected(selected?.id === item.id ? null : item)}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors hover:bg-gray-100 ${
              selected?.id === item.id ? 'bg-gray-100 ring-1 ring-blue-400' : ''
            }`}
          >
            <img
              src={`/MCToolKit/textures/${item.texture}`}
              alt={item.name[lang]}
              className='item-icon w-8 h-8'
              loading='lazy'
            />
            <span className='text-[9px] text-gray-400 leading-tight text-center line-clamp-2 w-full'>
              {item.name[lang]}
            </span>
          </button>
        ))}
      </div>

      {/* Detail */}
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