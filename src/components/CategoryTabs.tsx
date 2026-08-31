import { s } from '../lib/css';
import { useLang } from '../i18n/LangProvider';

interface Props {
  categories: string[];
  active: string | null;
  onSelect: (category: string) => void;
}

export function CategoryTabs({ categories, active, onSelect }: Props) {
  const { groupLabel } = useLang();

  return (
    <div
      className="scr"
      style={s('display:flex;gap:22px;overflow-x:auto;scrollbar-width:none')}
    >
      {categories.map((category) => (
        <div
          key={category}
          onClick={() => onSelect(category)}
          style={s(
            'flex:none;padding:0 0 12px;cursor:pointer;font:700 12px/1 Archivo,sans-serif;letter-spacing:.16em;text-transform:uppercase;transition:color .16s ease,border-color .16s ease;color:' +
              (category === active ? '#fff' : 'var(--color-neutral-600)') +
              ';border-bottom:2px solid ' +
              (category === active ? 'var(--color-accent)' : 'transparent'),
          )}
        >
          {groupLabel(category)}
        </div>
      ))}
    </div>
  );
}
