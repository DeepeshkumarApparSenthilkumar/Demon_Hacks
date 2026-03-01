import { useEffect, useRef, useCallback } from 'react';

const TIMEOUT_MS = 15 * 60 * 1000;       // 15 minutes
const WARNING_MS = 2 * 60 * 1000;         // warn at 2 min remaining
const EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

export function useSessionTimeout({ onTimeout, onWarning, enabled = true }) {
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const warnedRef = useRef(false);

  const reset = useCallback(() => {
    clearTimeout(timeoutRef.current);
    clearTimeout(warningRef.current);
    warnedRef.current = false;

    if (!enabled) return;

    warningRef.current = setTimeout(() => {
      if (!warnedRef.current) {
        warnedRef.current = true;
        onWarning?.();
      }
    }, TIMEOUT_MS - WARNING_MS);

    timeoutRef.current = setTimeout(() => {
      onTimeout?.();
    }, TIMEOUT_MS);
  }, [enabled, onTimeout, onWarning]);

  useEffect(() => {
    if (!enabled) return;

    reset();
    EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }));

    // Also listen for server-side session expiry events
    const handleServerExpiry = () => onTimeout?.();
    window.addEventListener('chi360:session-expired', handleServerExpiry);

    return () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(warningRef.current);
      EVENTS.forEach(e => window.removeEventListener(e, reset));
      window.removeEventListener('chi360:session-expired', handleServerExpiry);
    };
  }, [enabled, reset, onTimeout]);

  return { reset };
}
