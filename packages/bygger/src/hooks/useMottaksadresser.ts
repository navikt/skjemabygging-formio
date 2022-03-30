import Formiojs from "formiojs/Formio";
import { useContext, useEffect, useState } from "react";
import { NavFormType } from "../Forms/navForm";
import { UserAlerterContext } from "../userAlerting";
import { fromEntity, Mottaksadresse, MottaksadresseEntity } from "./mottaksadresser";

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
      method: "GET",
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        setErrorMessage("Feil ved henting av mottaksadresser");
        throw new Error(`Feil ved henting av mottaksadresser: ${res.status}`);
      })
      .then((mottaksadresser: MottaksadresseEntity[]) => {
        setMottaksadresseEntities(mottaksadresser);
        setMottaksadresser(mottaksadresser.map(fromEntity));
        setReady(true);
      })
      .catch((err) => console.error(err));
  };

  const deleteMottaksadresse = async (mottaksadresseId) => {
    const forms = await getFormsWithMottaksadresse(mottaksadresseId);
    if (forms.length > 0) {
      const skjemanummerliste = forms.map((form) => form.properties.skjemanummer).join(", ");
      userAlerter.setErrorMessage(`Mottaksadressen brukes i følgende skjema: ${skjemanummerliste}`);
      return Promise.reject();
    } else {
      return fetch(`${Formiojs.getProjectUrl()}/mottaksadresse/submission/${mottaksadresseId}`, {
        headers: {
          "x-jwt-token": Formiojs.getToken(),
        },
        method: "DELETE",
      })
        .then((res) => {
          if (res.ok) {
            loadMottaksadresser();
            userAlerter.flashSuccessMessage("Mottaksadresse slettet");
          } else {
            userAlerter.setErrorMessage(`Sletting feilet: ${res.status}`);
          }
        })
        .catch((err) => console.error(err));
    }
  };

  const publishMottaksadresser = async () => {
    const payload = {
      token: Formiojs.getToken(),
      resource: mottaksadresseEntities,
    };

    const response = await fetch("/api/published-resource/mottaksadresser", {
      headers: {
        "content-type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(payload),
    });

    const { changed } = await response.json();
    if (response.ok && changed) {
      userAlerter.flashSuccessMessage("Publisering startet");
    } else if (response.ok && !changed) {
      userAlerter.setWarningMessage(
        "Publiseringen inneholdt ingen endringer og ble avsluttet (nytt bygg av Fyllut ble ikke trigget)"
      );
    } else {
      userAlerter.setErrorMessage(`Publisering feilet: ${response.status}`);
    }
  };

  const getFormsWithMottaksadresse = async (mottaksadresseId): Promise<NavFormType[]> => {
    return fetch(
      `${Formiojs.getProjectUrl()}/form?type=form&tags=nav-skjema&limit=1000&properties.mottaksadresseId=${mottaksadresseId}`,
      {
        method: "GET",
      }
    ).then((forms) => forms.json());
  };

  useEffect(loadMottaksadresser, []);

  return {
    ready,
    errorMessage,
    mottaksadresser,
    mottaksadresseEntities,
    loadMottaksadresser,
    deleteMottaksadresse,
    publishMottaksadresser,
  };
};

export default useMottaksadresser;
