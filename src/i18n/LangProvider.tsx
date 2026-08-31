import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { FONT_FAMILY, GROUP_HE, TR, type Lang, type Strings } from './strings';

interface LangValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  tr: Strings;
  dir: 'ltr' | 'rtl';
  fontFamily: string;
  /** Category names are data, so they get translated at render time. */
  groupLabel: (name: string) => string;
}

const LangContext = createContext<LangValue | null>(null);
const STORAGE_KEY = 'gpt.lang';

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem(STORAGE_KEY) as Lang | null) ?? 'he',
  );

  const setLang = useCallback((next: Lang) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLangState(next);
  }, []);

  const dir = lang === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value = useMemo<LangValue>(
    () => ({
      lang,
      setLang,
      tr: TR[lang],
      dir,
      fontFamily: FONT_FAMILY[lang],
      groupLabel: (name: string) => (lang === 'he' ? (GROUP_HE[name] ?? name) : name),
    }),
    [lang, dir, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
  return ctx;
}
