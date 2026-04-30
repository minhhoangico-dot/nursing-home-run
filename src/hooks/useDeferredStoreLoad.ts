import { useEffect, useRef } from 'react';

export function useDeferredStoreLoad(
  fetcher: () => Promise<unknown>,
  alreadyLoaded: boolean,
  enabled = true,
) {
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!enabled || alreadyLoaded || hasTriggeredRef.current) {
      return;
    }

    hasTriggeredRef.current = true;
    void fetcher();
  }, [alreadyLoaded, enabled, fetcher]);
}
