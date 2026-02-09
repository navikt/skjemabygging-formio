import { useCallback, useEffect, useState } from 'react';

type LoaderState<T> = {
  data?: T;
  isReady: boolean;
};

/**
 * Runs the provided async fetcher once (until ready) and exposes reload and setData helpers.
 * State updates happen inside async callbacks and are guarded against unmount.
 */
export const useAsyncLoader = <T>(fetchFn: () => Promise<T>) => {
  const [state, setState] = useState<LoaderState<T>>({ isReady: false });

  const reload = useCallback(async () => {
    const data = await fetchFn();
    setState({ data, isReady: true });
    return data;
  }, [fetchFn]);

  const setData = useCallback((updater: (previous?: T) => T | undefined) => {
    setState((previous) => ({ data: updater(previous.data), isReady: true }));
  }, []);

  useEffect(() => {
    if (state.isReady) {
      return;
    }

    let cancelled = false;

    fetchFn()
      .then((data) => {
        if (cancelled) return;
        setState({ data, isReady: true });
      })
      .catch(() => {
        if (cancelled) return;
        setState((previous) => ({ ...previous }));
      });

    return () => {
      cancelled = true;
    };
  }, [fetchFn, state.isReady]);

  return { ...state, reload, setData };
};
