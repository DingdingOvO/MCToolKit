import { Link } from 'react-router-dom'
import { useLang } from '../components/LangContext'
import { t } from '../i18n'

type CardKey = 'itemTextures' | 'blockTextures' | 'soundResources'
type DescKey = 'itemDesc' | 'blockDesc' | 'soundDesc'

const CARDS: { to: string; count: string; titleKey: CardKey; descKey: DescKey }[] = [
  { to: '/items', count: '703', titleKey: 'itemTextures', descKey: 'itemDesc' },
  { to: '/blocks', count: '1269', titleKey: 'blockTextures', descKey: 'blockDesc' },
  { to: '/sounds', count: '4871', titleKey: 'soundResources', descKey: 'soundDesc' },
]

export default function Home() {
  const { lang } = useLang()
  const s = t(lang)

  return (
    <div className='max-w-3xl mx-auto px-6 py-20'>
      <div className='text-center mb-14'>
        <h1 className='text-4xl font-bold text-gray-900 tracking-tight'>{s.heroTitle}</h1>
        <p className='mt-3 text-gray-400 text-lg'>{s.heroSubtitle}</p>
      </div>

      <div className='grid sm:grid-cols-3 gap-3'>
        {CARDS.map(card => (
          <Link
            key={card.to}
            to={card.to}
            className='block bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all group'
          >
            <h2 className='text-sm font-semibold text-gray-900'>{s[card.titleKey]}</h2>
            <span className='inline-block mt-1.5 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium'>
              {card.count}
            </span>
            <p className='mt-3 text-sm text-gray-400 leading-relaxed'>{s[card.descKey]}</p>
          </Link>
        ))}
      </div>

      <p className='text-center mt-20 text-xs text-gray-300'>{s.footer}</p>
    </div>
  )
}