import { useCallback, useEffect, useRef, useState } from 'react';

/** Local value that writes back once the tapping stops.
 *
 * A stepper fires on every tap. Writing on each one raced the "is there a row
 * for today" lookup, so a burst could both duplicate history rows and leave
 * the chart a step behind — it only caught up on the next edit. Holding the
 * value locally and committing after a pause makes one write per burst.
 *
 * Server updates are adopted only while nothing is pending, so an in-flight
 * edit is never clobbered by the value it is about to replace.
 */
export function useDebouncedSave<T>(
  serverValue: T,
  save: (value: T) => void,
  delay = 700,
): [T, (next: T) => void] {
  const [local, setLocal] = useState(serverValue);
  const pending = useRef(false);
  const latestSave = useRef(save);
  latestSave.current = save;

  useEffect(() => {
    if (!pending.current) setLocal(serverValue);
  }, [serverValue]);

  const set = useCallback((next: T) => {
    pending.current = true;
    setLocal(next);
  }, []);

  useEffect(() => {
    if (!pending.current) return;
    const timer = setTimeout(() => {
      pending.current = false;
      latestSave.current(local);
    }, delay);
    return () => clearTimeout(timer);
  }, [local, delay]);

  return [local, set];
}
