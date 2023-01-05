import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import { useEffect, useState } from "react";

type Temakoder = Record<string, string>;

const useTemaKoder = () => {
  const { baseUrl } = useAppConfig();
  const [temaKoder, setTemaKoder] = useState<Temakoder>({});
  const [ready, setReady] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const loadTemaKoder = () => {
    fetch(`${baseUrl}/api/temakoder`)
      .then(async (res) => {
        if (res.ok) {
          setErrorMessage(undefined);
          return res.json();
        }
        setErrorMessage("Feil ved henting av temakoder. Venligst prøv igjen senere.");
        throw new Error(`Feil ved henting av temakoder: ${res.status}`);
      })
      .then((koder: Temakoder) => {
        setTemaKoder(koder);
        setReady(true);
      })
      .catch((err) => console.error(err));
  };

  useEffect(loadTemaKoder, [baseUrl]);

  return {
    ready,
    errorMessage,
    temaKoder,
  };
};

export default useTemaKoder;
