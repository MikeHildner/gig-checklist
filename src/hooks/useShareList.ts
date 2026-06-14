import { useCallback, useEffect, useRef, useState } from 'react';
import { GigChecklist } from '../types';
import { shareListText } from '../utils/exportText';

/**
 * Provides a `share(list)` action plus a transient `toast` message used to
 * confirm the web "copied to clipboard" fallback (native uses the OS sheet).
 */
export function useShareList() {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  const share = useCallback(
    (list: GigChecklist) => {
      shareListText(list, showToast);
    },
    [showToast]
  );

  return { share, toast };
}
