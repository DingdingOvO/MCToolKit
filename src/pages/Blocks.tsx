import { useState, useMemo, useCallback } from 'react'
import type { Block } from '../types'
import { useLang } from '../components/LangContext'
import { t } from '../i18n'
import BlockIcon from '../components/BlockIcon'

const BASE = '/MCToolKit/textures'

function downloadTex(path: string, name: string) {
  const a = document.createElement('a')
  a.href = `${BASE}/${path}.png`
  a.download = `${name}.png`
  a.click()
}

export default function Blocks() {
  const { lang } = useLang()
  const s = t(lang)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Block | null>(null)
  const [blocks, setBlocks] = useState<Block[]>([])

  useMemo(() => {
    import('../data/blocks.json').then(m => setBlocks(m.default as Block[]))
  }, [])

  const filtered = useMemo(() => {
    if (!blocks.length) return []
    if (!search.trim()) return blocks
    const q = search.toLowerCase().trim()
    return blocks.filter(b =>
      b.id.includes(q) ||
      Object.values(b.name).some(n => n.toLowerCase().includes(q))
    )
  }, [search, blocks])

  const dl = useCallback((block: Block) => {
    downloadTex(block.north, `${block.id}`)
  }, [])

  // Collect unique textures for a block (for "download all faces")
  const getUniqueFaces = useCallback((block: Block) => {
    const faces: { key: string; label: string; path: string }[] = []
    const seen = new Set<string>()
    const add = (key: string, label: string, path: string) => {
      if (path && !seen.has(path)) {
        seen.add(path)
        faces.push({ key, label, path })
      }
    }
    add('up', 'Top', block.up)
    add('north', 'Front', block.north)
    add('east', 'Right', block.east)
    return faces
  }, [])

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
          {s.blockCount.replace('{count}', String(filtered.length)).replace('{total}', String(blocks.length || 399))}
        </span>
        {search && filtered.length > 0 && (
          <button
            onClick={() => filtered.forEach((b, i) => setTimeout(() => dl(b), i * 80))}
            className='px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors'
          >
            {s.downloadAll}
          </button>
        )}
      </div>

      {!blocks.length ? (
        <div className='text-center py-20 text-sm text-gray-300'>...</div>
      ) : (
        <div className='grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-1.5'>
          {filtered.map(block => (
            <button
              key={block.id}
              onClick={() => setSelected(selected?.id === block.id ? null : block)}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors hover:bg-gray-100 ${
                selected?.id === block.id ? 'bg-gray-100 ring-1 ring-blue-400' : ''
              }`}
            >
              <BlockIcon block={block} size={24} />
              <span className='text-[9px] text-gray-400 leading-tight text-center line-clamp-2 w-full'>
                {block.name[lang] || block.id}
              </span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm' onClick={() => setSelected(null)}>
          <div className='bg-white rounded-xl border border-gray-200 p-5 w-80 shadow-xl' onClick={e => e.stopPropagation()}>
            <div className='flex gap-4 mb-4'>
              <div className='w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center shrink-0'>
                <BlockIcon block={selected} size={48} />
              </div>
              <div className='min-w-0 flex-1'>
                <h3 className='text-sm font-semibold text-gray-900'>{selected.name[lang] || selected.id}</h3>
                <p className='text-[11px] text-gray-300 font-mono mt-0.5'>{selected.id}</p>
                <div className='mt-1 space-y-0 text-[10px] text-gray-300'>
                  <p>top: {selected.up.replace('block/', '')}</p>
                  <p>side: {selected.north.replace('block/', '')}</p>
                  {selected.east !== selected.north && (
                    <p>right: {selected.east.replace('block/', '')}</p>
                  )}
                </div>
              </div>
            </div>
            {/* Face download buttons */}
            <div className='flex gap-2 flex-wrap'>
              {getUniqueFaces(selected).map(f => (
                <button
                  key={f.key}
                  onClick={() => downloadTex(f.path, `${selected.id}_${f.key}`)}
                  className='px-2.5 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors'
                >
                  {f.label}
                </button>
              ))}
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
