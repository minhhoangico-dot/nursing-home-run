import { useEffect, useRef } from 'react';

export function useDeferredStoreLoad(
  fetcher: () => Promise<unknown>,
  alreadyLoaded: boolean,
) {
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (alreadyLoaded || hasTriggeredRef.current) {
      return;
    }

    hasTriggeredRef.current = true;
    void fetcher();
  }, [alreadyLoaded, fetcher]);
}
