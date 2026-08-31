/** Prefix search across the words of a set of fields.
 *
 * "os" finds "Marcus Osei" because a word starts with it; "sei" no longer
 * does. Multi-word queries require every term to match some word, so
 * "mar os" still finds Marcus Osei. Email addresses are split on their
 * punctuation too, so "edan" matches edangur11@gmail.com.
 */
const SEPARATORS = /[\s@._+-]+/;

export function matchesPrefix(query: string, ...fields: (string | null | undefined)[]): boolean {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const words = fields
    .filter((field): field is string => Boolean(field))
    .flatMap((field) => field.toLowerCase().split(SEPARATORS))
    .filter(Boolean);

  return terms.every((term) => words.some((word) => word.startsWith(term)));
}
