import { useState, useMemo, useCallback } from 'react'
import itemsData from '../data/items.json'
import type { Item } from '../types'
import { useLang } from '../components/LangContext'
import { t, LANG_OPTIONS } from '../i18n'

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

  const handleDownload = useCallback((item: Item) => {
    const link = document.createElement('a')
    link.href = `/MCToolKit/textures/${item.texture}`
    link.download = `${item.id}.png`
    link.click()
  }, [])

  const handleDownloadAll = useCallback(() => {
    filtered.forEach((item, i) => {
      setTimeout(() => handleDownload(item), i * 100)
    })
  }, [filtered, handleDownload])

  return (
    <>
      <div className='max-w-6xl mx-auto px-4 pt-4 pb-2 flex items-center gap-3 flex-wrap'>
        <h2 className='text-base font-semibold text-gray-900 whitespace-nowrap'>{s.itemTextures}</h2>
        <div className='relative flex-1 min-w-[180px]'>
          <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
          </svg>
          <input
            type='text'
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={s.searchPlaceholder}
            className='w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors'
          />
        </div>
        <span className='text-sm text-gray-400'>
          {s.itemCount.replace('{count}', String(filtered.length)).replace('{total}', String(ITEMS.length))}
        </span>
        {search && (
          <button
            onClick={handleDownloadAll}
            className='px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap'
          >
            {s.downloadAll}
          </button>
        )}
      </div>

      <div className='max-w-6xl mx-auto px-4 py-4'>
        <div className='grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2'>
          {filtered.map(item => (
            <button
              key={item.id}
              onClick={() => setSelected(selected?.id === item.id ? null : item)}
              className={`group flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:bg-gray-100 ${
                selected?.id === item.id ? 'bg-gray-100 ring-2 ring-blue-500' : ''
              }`}
            >
              <img
                src={`/MCToolKit/textures/${item.texture}`}
                alt={item.name[lang]}
                className='item-icon w-10 h-10'
                loading='lazy'
              />
              <span className='text-[10px] text-gray-400 leading-tight text-center line-clamp-2 group-hover:text-gray-600 transition-colors'>
                {item.name[lang]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center bg-black/30'
          onClick={() => setSelected(null)}
        >
          <div
            className='bg-white border border-gray-200 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl'
            onClick={e => e.stopPropagation()}
          >
            <div className='flex items-start gap-4 mb-4'>
              <div className='w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center shrink-0'>
                <img src={`/MCToolKit/textures/${selected.texture}`} alt={selected.name[lang]} className='item-icon w-14 h-14' />
              </div>
              <div className='flex-1 min-w-0'>
                <h3 className='text-base font-semibold text-gray-900 mb-1'>{selected.name[lang]}</h3>
                <p className='text-xs text-gray-400 font-mono'>{selected.id}</p>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-x-4 gap-y-1.5 mb-5'>
              {LANG_OPTIONS.map(opt => (
                <div key={opt.code} className='flex items-center gap-2 text-sm'>
                  <span className='text-gray-300 text-xs w-14 shrink-0'>{opt.label}</span>
                  <span className='text-gray-600 truncate'>{selected.name[opt.code]}</span>
                </div>
              ))}
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => handleDownload(selected)}
                className='flex-1 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors'
              >
                {s.downloadTexture}
              </button>
              <button
                onClick={() => setSelected(null)}
                className='px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-lg transition-colors'
              >
                {s.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}