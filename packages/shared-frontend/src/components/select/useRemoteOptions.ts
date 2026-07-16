import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';

const loadRemoteOptions = async (url: string): Promise<ComponentValue[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load remote options: ${response.status}`);
  }

  return response.json() as Promise<ComponentValue[]>;
};

const useRemoteOptions = (url?: string) => {
  const [values, setValues] = useState<ComponentValue[] | undefined>();
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    if (!url) {
      return;
    }

    let cancelled = false;

    void loadRemoteOptions(url)
      .then((options) => {
        if (!cancelled) {
          setValues(options);
          setError(undefined);
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setValues([]);
          setError(fetchError instanceof Error ? fetchError : new Error(String(fetchError)));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { values, error };
};

export { loadRemoteOptions, useRemoteOptions };
