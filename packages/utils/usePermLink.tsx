import { useEffect, useState } from 'react';
import { permLinkParams } from './permlink';

/**
 * SSR compatible
 */

export function usePermLink(path: string, hashedToken?: string | null, readable = true) {
  const [url, setUrl] = useState(() => `/api/raw/?${permLinkParams(path, hashedToken, readable)}`);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(`/api/raw/?${permLinkParams(path, hashedToken, readable)}`);
    }
  }, [hashedToken, path, readable]);
  return url;
}
