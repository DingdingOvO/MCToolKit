import { useLang } from '../components/LangContext'
import { t } from '../i18n'

export default function Blocks() {
  const { lang } = useLang()
  const s = t(lang)
  return (
    <div className='max-w-5xl mx-auto px-5 py-16 text-center'>
      <h2 className='text-lg font-semibold text-gray-900'>{s.blockTextures}</h2>
      <p className='mt-2 text-sm text-gray-300'>{s.comingSoon} — 1269</p>
    </div>
  )
}