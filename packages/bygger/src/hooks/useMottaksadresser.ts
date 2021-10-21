import {useEffect, useState} from "react";
import Formiojs from "formiojs/Formio";
import {fromEntity, Mottaksadresse, MottaksadresseEntity} from "./mottaksadresser";

const useMottaksadresser = () => {

  const [mottaksadresser, setMottaksadresser] = useState<Mottaksadresse[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetch(`${Formiojs.getProjectUrl()}/mottaksadresse/submission`)
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        setErrorMessage("Feil ved henting av mottaksadresser");
        throw new Error(`Feil ved henting av mottaksadresser: ${res.status}`);
      })
      .then((mottaksadresser: MottaksadresseEntity[]) => {
        setMottaksadresser(mottaksadresser.map(fromEntity));
        setReady(true);
      })
      .catch(err => console.error(err));
  }, []);

  return {ready, errorMessage, mottaksadresser};

};

export default useMottaksadresser;
