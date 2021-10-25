import {useEffect, useState} from "react";
import Formiojs from "formiojs/Formio";
import {fromEntity, Mottaksadresse, MottaksadresseEntity} from "./mottaksadresser";

interface Output {
  mottaksadresser: Mottaksadresse[];
  mottaksadresseEntities: MottaksadresseEntity[];
  ready: boolean;
  errorMessage?: string;
  loadMottaksadresser: Function;
  deleteMottaksadresse: Function;
}

const useMottaksadresser = (): Output => {

  const [mottaksadresser, setMottaksadresser] = useState<Mottaksadresse[]>([]);
  const [mottaksadresseEntities, setMottaksadresseEntities] = useState<MottaksadresseEntity[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const loadMottaksadresser = () => {
    fetch(`${Formiojs.getProjectUrl()}/mottaksadresse/submission`, {
      method: "GET"
    })
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        setErrorMessage("Feil ved henting av mottaksadresser");
        throw new Error(`Feil ved henting av mottaksadresser: ${res.status}`);
      })
      .then((mottaksadresser: MottaksadresseEntity[]) => {
        setMottaksadresseEntities(mottaksadresser);
        setMottaksadresser(mottaksadresser.map(fromEntity));
        setReady(true);
      })
      .catch(err => console.error(err));
  };

  const deleteMottaksadresse = (submissionId) => {
    fetch(`${Formiojs.getProjectUrl()}/mottaksadresse/submission/${submissionId}`, {
      headers: {
        "x-jwt-token": Formiojs.getToken(),
      },
      method: "DELETE",
    })
      .then(res => {
        if (res.ok) {
          loadMottaksadresser();
        } else {
          setErrorMessage("Feil ved sletting av mottaksadresse");
          throw new Error(`Feil ved sletting av mottaksadresse: ${res.status}`);
        }
      })
      .catch(err => console.error(err));
  }

  useEffect(loadMottaksadresser, []);

  return {ready, errorMessage, mottaksadresser, mottaksadresseEntities, loadMottaksadresser, deleteMottaksadresse};

};

export default useMottaksadresser;
