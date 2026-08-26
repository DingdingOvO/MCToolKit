import { createContext, useContext, useState, type ReactNode } from 'react'
import type { LangCode } from '../i18n'

interface LangContextValue {
  lang: LangCode
  setLang: (lang: LangCode) => void
}

const LangContext = createContext<LangContextValue>({
  lang: 'zh_cn',
  setLang: () => {},
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<LangCode>('zh_cn')
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}