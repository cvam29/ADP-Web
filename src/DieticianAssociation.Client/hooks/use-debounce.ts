// Debounce hook utilities
import { useCallback, useEffect, useRef, useState } from "react";

// Simple value debounce
export default function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

// Action guard to prevent rapid double clicks / submits with a small cooldown and loading flag
export function usePreventDoubleClick<T extends (...args: any[]) => any>(
  fn: T,
  cooldownMs = 1000
): [(
  ...args: Parameters<T>
) => Promise<ReturnType<T> | void>, boolean] {
  const [loading, setLoading] = useState(false);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, []);

  const wrapped = useCallback(async (...args: Parameters<T>) => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await fn(...args);
      return result as ReturnType<T>;
    } finally {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
      cooldownRef.current = setTimeout(() => setLoading(false), cooldownMs);
    }
  }, [fn, loading, cooldownMs]);

  return [wrapped, loading];
}
