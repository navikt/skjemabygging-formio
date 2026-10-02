import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';

const useRemoteOptions = (loadOptions?: () => Promise<ComponentValue[]>) => {
  const [values, setValues] = useState<ComponentValue[] | undefined>();
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    if (!loadOptions) {
      return;
    }

    let cancelled = false;

    void loadOptions()
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
  }, [loadOptions]);

  return { values, error };
};

export { useRemoteOptions };
