import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import type { Block } from '../types'
import { useLang } from '../components/LangContext'
import { t } from '../i18n'
import BlockIcon from '../components/BlockIcon'

const BASE = '/MCToolKit/textures/block'
const FACE_KEYS = ['up', 'down', 'north', 'south', 'east', 'west'] as const

const FACE_LABELS: Record<string, Record<string, string>> = {
  zh_cn: { up: '顶面', down: '底面', north: '北面', south: '南面', east: '东面', west: '西面' },
  en_us: { up: 'Top', down: 'Bottom', north: 'North', south: 'South', east: 'East', west: 'West' },
  zh_tw: { up: '頂面', down: '底面', north: '北面', south: '南面', east: '東面', west: '西面' },
  ja_jp: { up: '上', down: '下', north: '北', south: '南', east: '東', west: '西' },
  ko_kr: { up: '윗면', down: '아랫면', north: '북면', south: '남면', east: '동면', west: '서면' },
  de_de: { up: 'Oben', down: 'Unten', north: 'Norden', south: 'Süden', east: 'Osten', west: 'Westen' },
  fr_fr: { up: 'Dessus', down: 'Dessous', north: 'Nord', south: 'Sud', east: 'Est', west: 'Ouest' },
}

function getFaceLabel(face: string, lang: string) {
  return FACE_LABELS[lang]?.[face] ?? FACE_LABELS.en_us[face] ?? face
}

function downloadTex(path: string, name: string) {
  const a = document.createElement('a')
  a.href = `${BASE}/${path}.png`
  a.download = `${name}.png`
  a.click()
}

/* IntersectionObserver stagger */
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

/* ============================================================ */
/* Blocks page                                                  */
/* ============================================================ */

const ICON_SIZE = 48

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
    downloadTex(block.faces.north, block.id)
  }, [])

  const getUniqueFaces = useCallback((block: Block) => {
    const faces: { key: string; label: string; path: string }[] = []
    const seen = new Set<string>()
    for (const key of FACE_KEYS) {
      const p = block.faces[key]
      if (p && !seen.has(p)) {
        seen.add(p)
        faces.push({ key, label: getFaceLabel(key, lang), path: p })
      }
    }
    return faces
  }, [lang])

  const { containerRef, visible } = useStaggerReveal(search)

  return (
    <div className='max-w-5xl mx-auto px-5 py-4'>
      {/* Search bar */}
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
          {s.blockCount.replace('{count}', String(filtered.length)).replace('{total}', String(blocks.length || 0))}
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

      {/* Block grid */}
      {!blocks.length ? (
        <div className='text-center py-20 text-sm text-gray-300'>...</div>
      ) : (
        <div ref={containerRef} className='grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-1.5'>
          {filtered.map(block => {
            const show = visible.has(block.id)
            return (
              <button
                key={block.id}
                data-id={block.id}
                onClick={() => setSelected(selected?.id === block.id ? null : block)}
                className={`stagger-cell flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors hover:bg-gray-100 ${
                  selected?.id === block.id ? 'bg-gray-100 ring-1 ring-blue-400' : ''
                } ${show ? 'stagger-visible' : ''}`}
              >
                <BlockIcon block={block} size={ICON_SIZE} />
                <span className='text-[10px] text-gray-400 leading-tight text-center line-clamp-2 w-full'>
                  {block.name[lang] || block.id}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <BlockDetailModal
          block={selected}
          lang={lang}
          onClose={() => setSelected(null)}
          getUniqueFaces={getUniqueFaces}
          ui={s}
        />
      )}
    </div>
  )
}

/* ============================================================ */
/* Detail modal — static isometric + 6 face textures            */
/* ============================================================ */

function BlockDetailModal({
  block,
  lang,
  onClose,
  getUniqueFaces,
  ui,
}: {
  block: Block
  lang: string
  onClose: () => void
  getUniqueFaces: (b: Block) => { key: string; label: string; path: string }[]
  ui: ReturnType<typeof t>
}) {
  const texUrl = (name: string) => `${BASE}/${name}.png`
  const uniqueFaces = getUniqueFaces(block)

  return (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden'
        style={{ width: 420 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header + large icon */}
        <div className='px-5 pt-5 pb-4 flex gap-4 items-start'>
          <div className='bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center shrink-0'
            style={{ width: 80, height: 80 }}>
            <BlockIcon block={block} size={64} />
          </div>
          <div className='min-w-0 flex-1 pt-0.5'>
            <h3 className='text-sm font-semibold text-gray-900 truncate'>
              {block.name[lang] || block.id}
            </h3>
            <p className='text-[11px] text-gray-300 font-mono mt-0.5'>{block.id}</p>
          </div>
          <button
            onClick={onClose}
            className='p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors -mr-1 -mt-1'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* 6 face textures */}
        <div className='px-5 pb-4'>
          <p className='text-[10px] text-gray-300 mb-2.5 uppercase tracking-wider'>
            {lang === 'zh_cn' ? '各面贴图' : lang === 'zh_tw' ? '各面貼圖' : 'Face Textures'}
          </p>
          <div className='grid grid-cols-6 gap-2'>
            {FACE_KEYS.map(key => (
              <div key={key} className='flex flex-col items-center gap-1'>
                <div className='w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden'>
                  <img
                    src={texUrl(block.faces[key])}
                    alt={getFaceLabel(key, lang)}
                    className='w-full h-full'
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <span className='text-[8px] text-gray-400 leading-none'>{getFaceLabel(key, lang)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Download buttons */}
        <div className='px-5 py-3 border-t border-gray-100 flex gap-1.5 flex-wrap'>
          {uniqueFaces.map(f => (
            <button
              key={f.key}
              onClick={() => downloadTex(f.path, `${block.id}_${f.key}`)}
              className='px-2.5 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors'
            >
              {f.label}
            </button>
          ))}
          <div className='flex-1' />
          <button
            onClick={onClose}
            className='px-3 py-1.5 text-xs text-gray-400 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
          >
            {ui.close}
          </button>
        </div>
      </div>
    </div>
  )
}