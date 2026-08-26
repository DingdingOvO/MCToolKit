import { useLang } from '../components/LangContext'
import { t } from '../i18n'

export default function Blocks() {
  const { lang } = useLang()
  const s = t(lang)
  return (
    <div className='max-w-6xl mx-auto px-4 py-16 text-center'>
      <h2 className='text-xl font-semibold text-gray-900 mb-2'>{s.blockTextures}</h2>
      <p className='text-gray-400'>{s.comingSoon} — 1269</p>
    </div>
  )
}