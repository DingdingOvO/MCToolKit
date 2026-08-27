import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import type { Sound } from '../types'
import { useLang } from '../components/LangContext'
import { t } from '../i18n'

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  zh_cn: {
    mob: '生物', block: '方块', item: '物品', ambient: '环境', entity: '实体',
    music: '音乐', step: '脚步', random: '随机', dig: '挖掘', liquid: '液体',
    records: '唱片', note: '音符', enchant: '附魔', ui: '界面',
    fireworks: '烟花', event: '事件', minecart: '矿车', damage: '伤害',
    portal: '传送门', tile: '瓦片', fire: '火焰', other: '其他',
  },
  en_us: {
    mob: 'Mob', block: 'Block', item: 'Item', ambient: 'Ambient', entity: 'Entity',
    music: 'Music', step: 'Step', random: 'Random', dig: 'Dig', liquid: 'Liquid',
    records: 'Records', note: 'Note', enchant: 'Enchant', ui: 'UI',
    fireworks: 'Fireworks', event: 'Event', minecart: 'Minecart', damage: 'Damage',
    portal: 'Portal', tile: 'Tile', fire: 'Fire', other: 'Other',
  },
}

function getCatLabel(cat: string, lang: string): string {
  return CATEGORY_LABELS[lang]?.[cat] ?? CATEGORY_LABELS.en_us[cat] ?? cat
}

export default function Sounds() {
  const { lang } = useLang()
  const s = t(lang)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [playing, setPlaying] = useState<string | null>(null)
  const [sounds, setSounds] = useState<Sound[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState<Set<string>>(new Set())
  const counter = useRef(0)
  const pending = useRef<HTMLElement[]>([])

  useMemo(() => {
    import('../data/sounds.json').then(m => setSounds(m.default as Sound[]))
  }, [])

  const categories = useMemo(() => {
    const set = new Set(sounds.map(s => s.category))
    return Array.from(set).sort()
  }, [sounds])

  const filtered = useMemo(() => {
    if (!sounds.length) return []
    let list = sounds
    if (category) list = list.filter(s => s.category === category)
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(s => {
        const pathId = s.path.replace('sounds/', '').replace('.ogg', '')
        return s.id.includes(q) || pathId.includes(q) || s.category.includes(q)
      })
    }
    return list
  }, [search, category, sounds])

  /* IntersectionObserver stagger for list items */
  useEffect(() => {
    if (!listRef.current) return
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
              el.style.transitionDelay = `${Math.min(idx * 2, 600)}ms`
              next.add(el.dataset.id!)
            }
            setVisible(next)
          })
        }
      },
      { rootMargin: '300px 0px', threshold: 0 }
    )

    const items = listRef.current.querySelectorAll<HTMLElement>('[data-id]')
    items.forEach(el => observer.observe(el))

    return () => {
      observer.disconnect()
      if (batchRaf) cancelAnimationFrame(batchRaf)
    }
  }, [search, category])

  const play = useCallback((sound: Sound) => {
    const url = `/MCToolKit/${sound.path}`
    if (playing === sound.path) {
      audioRef.current?.pause()
      setPlaying(null)
      return
    }
    if (audioRef.current) {
      audioRef.current.pause()
    }
    const audio = new Audio(url)
    audio.onended = () => setPlaying(null)
    audio.onerror = () => setPlaying(null)
    audio.play().catch(() => setPlaying(null))
    audioRef.current = audio
    setPlaying(sound.path)
  }, [playing])

  const stop = useCallback(() => {
    audioRef.current?.pause()
    audioRef.current = null
    setPlaying(null)
  }, [])

  const dl = useCallback((sound: Sound) => {
    const a = document.createElement('a')
    a.href = `/MCToolKit/${sound.path}`
    const fname = sound.path.split('/').pop() || sound.id
    a.download = fname
    a.click()
  }, [])

  useEffect(() => {
    return () => { audioRef.current?.pause() }
  }, [])

  return (
    <div className='max-w-5xl mx-auto px-5 py-4'>
      <div className='flex flex-wrap items-center gap-3 mb-4'>
        <div className='relative flex-1 min-w-[180px] max-w-sm'>
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
        <div className='relative'>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className='appearance-none pl-3 pr-7 py-1.5 text-[13px] bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-gray-300 cursor-pointer'
          >
            <option value=''>{s.allCategories}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{getCatLabel(cat, lang)} ({sounds.filter(s => s.category === cat).length})</option>
            ))}
          </select>
          <svg className='absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300 pointer-events-none' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
          </svg>
        </div>
        <span className='text-xs text-gray-300 tabular-nums'>
          {s.soundCount.replace('{count}', String(filtered.length)).replace('{total}', String(sounds.length || 0))}
        </span>
        {playing && (
          <button onClick={stop} className='px-3 py-1.5 text-xs text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'>
            {s.stop}
          </button>
        )}
      </div>

      {!sounds.length ? (
        <div className='text-center py-20 text-sm text-gray-300'>...</div>
      ) : (
        <div ref={listRef} className='space-y-0.5'>
          {filtered.map(sound => {
            const isPlaying = playing === sound.path
            const displayPath = sound.path.replace('sounds/', '')
            const show = visible.has(sound.path)
            return (
              <div
                key={sound.path}
                data-id={sound.path}
                className={`stagger-cell flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors group ${
                  isPlaying ? 'bg-blue-50' : 'hover:bg-gray-50'
                } ${show ? 'stagger-visible' : ''}`}
              >
                <button
                  onClick={() => play(sound)}
                  className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isPlaying
                      ? 'text-blue-600 bg-blue-100'
                      : 'text-gray-300 bg-gray-100 hover:bg-gray-200 hover:text-gray-500'
                  }`}
                  title={isPlaying ? s.pause : s.play}
                >
                  {isPlaying ? (
                    <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 24 24'>
                      <rect x='6' y='4' width='4' height='16' rx='1' />
                      <rect x='14' y='4' width='4' height='16' rx='1' />
                    </svg>
                  ) : (
                    <svg className='w-3 h-3 ml-0.5' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M8 5v14l11-7z' />
                    </svg>
                  )}
                </button>
                <div className='flex-1 min-w-0'>
                  <span className='text-[13px] text-gray-700 block truncate'>{sound.id}</span>
                  <span className='text-[11px] text-gray-300 font-mono block truncate'>{displayPath}</span>
                </div>
                <span className='text-[10px] text-gray-300 bg-gray-50 px-1.5 py-0.5 rounded shrink-0'>
                  {getCatLabel(sound.category, lang)}
                </span>
                <button
                  onClick={() => dl(sound)}
                  className='opacity-0 group-hover:opacity-100 shrink-0 p-1 text-gray-300 hover:text-gray-600 transition-all'
                  title={s.download}
                >
                  <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}