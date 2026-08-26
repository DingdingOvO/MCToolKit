import { Link } from 'react-router-dom'
import { useLang } from '../components/LangContext'
import { t } from '../i18n'

const CARDS = [
  { to: '/items', icon: 'pick', count: '1222', titleKey: 'itemTextures' as const, descKey: 'itemDesc' as const },
  { to: '/blocks', icon: 'block', count: '1269', titleKey: 'blockTextures' as const, descKey: 'blockDesc' as const },
  { to: '/sounds', icon: 'sound', count: '4871', titleKey: 'soundResources' as const, descKey: 'soundDesc' as const },
]

export default function Home() {
  const { lang } = useLang()
  const s = t(lang)

  return (
    <div className='max-w-4xl mx-auto px-4 py-16'>
      <div className='text-center mb-12'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>{s.heroTitle}</h1>
        <p className='text-gray-500'>{s.heroSubtitle}</p>
      </div>

      <div className='grid sm:grid-cols-3 gap-4'>
        {CARDS.map(card => (
          <Link
            key={card.to}
            to={card.to}
            className='group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all'
          >
            <div className='flex items-center gap-2 mb-3'>
              <h2 className='text-base font-semibold text-gray-900'>{s[card.titleKey]}</h2>
              <span className='text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium'>
                {card.count}
              </span>
            </div>
            <p className='text-sm text-gray-400'>{s[card.descKey]}</p>
          </Link>
        ))}
      </div>

      <p className='text-center mt-16 text-xs text-gray-300'>{s.footer}</p>
    </div>
  )
}