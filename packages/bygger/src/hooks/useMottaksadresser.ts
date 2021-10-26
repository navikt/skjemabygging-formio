import {useContext, useEffect, useState} from "react";
import Formiojs from "formiojs/Formio";
import {fromEntity, Mottaksadresse, MottaksadresseEntity} from "./mottaksadresser";
import {UserAlerterContext} from "../userAlerting";
import {NavFormType} from "../Forms/navForm";

interface Output {
  mottaksadresser: Mottaksadresse[];
  mottaksadresseEntities: MottaksadresseEntity[];
  ready: boolean;
  errorMessage?: string;
  loadMottaksadresser: Function;
  deleteMottaksadresse: Function;
  publishMottaksadresser: Function;
}

const useMottaksadresser = (): Output => {

  const userAlerter = useContext(UserAlerterContext);
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

  const deleteMottaksadresse = async (mottaksadresseId) => {
    const forms = await getFormsWithMottaksadresse(mottaksadresseId);
    if (forms.length > 0) {
      const skjemanummerliste = forms.map(form => form.properties.skjemanummer).join(", ");
      userAlerter.setErrorMessage(`Mottaksadressen brukes i følgende skjema: ${skjemanummerliste}`);
      return Promise.reject();
    } else {
      return fetch(`${Formiojs.getProjectUrl()}/mottaksadresse/submission/${mottaksadresseId}`, {
        headers: {
          "x-jwt-token": Formiojs.getToken(),
        },
        method: "DELETE",
      })
        .then(res => {
          if (res.ok) {
            loadMottaksadresser();
            userAlerter.flashSuccessMessage("Mottaksadresse slettet");
          } else {
            setErrorMessage("Feil ved sletting av mottaksadresse");
            userAlerter.setErrorMessage(`Sletting feilet: ${res.status}`);
          }
        })
        .catch(err => console.error(err));

    }
  }

  const publishMottaksadresser = () => {
    const payload = {
      token: Formiojs.getToken(),
      resource: mottaksadresseEntities,
    }
    return fetch("/api/published-resource/mottaksadresser", {
      headers: {
        "content-type": "application/json"
      },
      method: "PUT",
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (res.ok) {
          userAlerter.flashSuccessMessage("Publisering fullført");
        } else {
          userAlerter.setErrorMessage(`Publisering feilet: ${res.status}`);
        }
      });
  }

  const getFormsWithMottaksadresse = async (mottaksadresseId): Promise<NavFormType[]> => {
    return fetch(`${Formiojs.getProjectUrl()}/form?type=form&tags=nav-skjema&limit=1000&properties.mottaksadresseId=${mottaksadresseId}`, {
      method: "GET"
    })
      .then(forms => forms.json());
  };

  useEffect(loadMottaksadresser, []);

  return {ready, errorMessage, mottaksadresser, mottaksadresseEntities, loadMottaksadresser, deleteMottaksadresse, publishMottaksadresser};

};

export default useMottaksadresser;
