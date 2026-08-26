import { useState, useMemo, useCallback } from 'react'
import itemsData from './data/items.json'
import type { Item } from './types'

const ITEMS: Item[] = itemsData as Item[]

function App() {
  const [search, setSearch] = useState('')
  const [lang, setLang] = useState<'zh_cn' | 'en_us' | 'zh_tw' | 'ja_jp' | 'ko_kr' | 'de_de' | 'fr_fr'>('zh_cn')
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
    link.href = `/${item.texture}`
    link.download = `${item.id}.png`
    link.click()
  }, [])

  const handleDownloadAll = useCallback(() => {
    filtered.forEach((item, i) => {
      setTimeout(() => handleDownload(item), i * 100)
    })
  }, [filtered, handleDownload])

  const langLabels: Record<string, string> = {
    zh_cn: '简体中文', en_us: 'English', zh_tw: '繁體中文',
    ja_jp: '日本語', ko_kr: '한국어', de_de: 'Deutsch', fr_fr: 'Français'
  }

  return (
    <div className="min-h-screen bg-mc-darker text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-mc-dark/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <h1 className="text-xl font-bold text-mc-green tracking-wide whitespace-nowrap">
            MCToolKit
          </h1>
          <span className="text-sm text-white/40 hidden sm:inline">物品贴图浏览器</span>
          <div className="flex-1" />
          {/* Language Switcher */}
          <div className="flex gap-1 flex-wrap">
            {(Object.keys(langLabels) as Array<keyof typeof langLabels>).map(code => (
              <button
                key={code}
                onClick={() => setLang(code as typeof lang)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  lang === code
                    ? 'bg-mc-green text-mc-darker font-bold'
                    : 'bg-mc-gray text-white/60 hover:bg-mc-light hover:text-white'
                }`}
              >
                {langLabels[code]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索物品名称或 ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-mc-gray border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-mc-green/50 focus:ring-1 focus:ring-mc-green/30 transition-all"
          />
        </div>
        <span className="text-sm text-white/50">
          {filtered.length} / {ITEMS.length} 物品
        </span>
        {search && (
          <button
            onClick={handleDownloadAll}
            className="px-4 py-2.5 bg-mc-brown hover:bg-amber-700 text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap"
          >
            下载全部搜索结果
          </button>
        )}
      </div>

      {/* Item Grid */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
          {filtered.map(item => (
            <button
              key={item.id}
              onClick={() => setSelected(selected?.id === item.id ? null : item)}
              className={`group flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:bg-mc-gray ${
                selected?.id === item.id ? 'bg-mc-gray ring-2 ring-mc-green' : ''
              }`}
              title={`${item.name[lang]} (${item.id})`}
            >
              <img
                src={`/${item.texture}`}
                alt={item.name[lang]}
                className="item-icon w-10 h-10"
                loading="lazy"
              />
              <span className="text-[10px] text-white/50 leading-tight text-center line-clamp-2 group-hover:text-white/80 transition-colors">
                {item.name[lang]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-mc-dark border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-24 h-24 bg-[#1e1e2e] rounded-xl flex items-center justify-center shrink-0">
                <img
                  src={`/${selected.texture}`}
                  alt={selected.name[lang]}
                  className="item-icon w-16 h-16"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white mb-1">{selected.name[lang]}</h2>
                <p className="text-xs text-white/40 font-mono">{selected.id}</p>
                <p className="text-xs text-white/30 mt-1">{selected.texture}</p>
              </div>
            </div>

            {/* All Languages */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(Object.entries(langLabels) as [string, string][]).map(([code, label]) => (
                <div key={code} className="flex items-center gap-2 text-sm">
                  <span className="text-white/30 text-xs w-12 shrink-0">{label}</span>
                  <span className="text-white/70 truncate">{selected.name[code]}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(selected)}
                className="flex-1 py-2.5 bg-mc-green hover:bg-green-600 text-mc-darker font-bold text-sm rounded-lg transition-colors"
              >
                下载贴图
              </button>
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2.5 bg-mc-gray hover:bg-mc-light text-white/60 text-sm rounded-lg transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App