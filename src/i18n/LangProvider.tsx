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

/** How far to boost the design's type, by how large it already is:
   sm  under 13px — kickers, meta lines, chart labels
   md  13-24px    — body, row titles, buttons, headers
   lg  over 24px  — the display numerals and screen titles

   Hebrew takes the same boost throughout. Archivo's display sizes already
   read large, so English holds the top end back rather than dragging the
   small text down with it. */
const TYPE_SCALE: Record<Lang, { sm: number; md: number; lg: number }> = {
  en: { sm: 1.4, md: 1.26, lg: 1.08 },
  he: { sm: 1.4, md: 1.4, lg: 1.4 },
};

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
    for (const [size, value] of Object.entries(TYPE_SCALE[lang])) {
      document.documentElement.style.setProperty(`--type-${size}`, String(value));
    }
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
