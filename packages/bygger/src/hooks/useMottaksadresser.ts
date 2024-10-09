import { NavFormioJs } from '@navikt/skjemadigitalisering-shared-components';
import { Mottaksadresse, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext';

interface Output {
  mottaksadresser: Mottaksadresse[];
  ready: boolean;
  errorMessage?: string;
  loadMottaksadresser: () => void;
  deleteMottaksadresse: (id: string) => Promise<void>;
  publishMottaksadresser: () => Promise<void>;
}

const useMottaksadresser = (): Output => {
  const feedbackEmit = useFeedbackEmit();
  const [mottaksadresser, setMottaksadresser] = useState<Mottaksadresse[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const loadMottaksadresser = () => {
    fetch(`/api/recipients`, {
      method: 'GET',
    })
      .then(async (res) => {
        if (res.ok) {
          setErrorMessage(undefined);
          return await res.json();
        }
        setErrorMessage('Feil ved henting av mottaksadresser');
        throw new Error(`Feil ved henting av mottaksadresser: ${res.status}`);
      })
      .then((recipients) => {
        setMottaksadresser(
          recipients.map(
            ({ recipientId, name, poBoxAddress, postalCode, postalName }): Mottaksadresse => ({
              data: {
                id: recipientId,
                adresselinje1: name,
                adresselinje2: poBoxAddress,
                postnummer: postalCode,
                poststed: postalName,
              },
            }),
          ),
        );
        setReady(true);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const deleteMottaksadresse = async (mottaksadresseId) => {
    const forms = await getFormsWithMottaksadresse(mottaksadresseId);
    if (forms.length > 0) {
      const skjemanummerliste = forms.map((form) => form.properties.skjemanummer).join(', ');
      feedbackEmit.error(`Mottaksadressen brukes i følgende skjema: ${skjemanummerliste}`);
      return Promise.reject();
    } else {
      return fetch(`${NavFormioJs.Formio.getProjectUrl()}/mottaksadresse/submission/${mottaksadresseId}`, {
        headers: {
          'x-jwt-token': NavFormioJs.Formio.getToken(),
        },
        method: 'DELETE',
      })
        .then((res) => {
          if (res.ok) {
            loadMottaksadresser();
            feedbackEmit.success('Mottaksadresse slettet');
          } else {
            feedbackEmit.error(`Sletting feilet: ${res.status}`);
          }
        })
        .catch((err) => console.error(err));
    }
  };

  const publishMottaksadresser = async () => {
    const payload = {
      token: NavFormioJs.Formio.getToken(),
      resource: mottaksadresser,
    };

    const response = await fetch('/api/published-resource/mottaksadresser', {
      headers: {
        'content-type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    const { changed } = await response.json();
    if (response.ok && changed) {
      feedbackEmit.success('Publisering startet');
    } else if (response.ok && !changed) {
      feedbackEmit.warning(
        'Publiseringen inneholdt ingen endringer og ble avsluttet (nytt bygg av Fyllut ble ikke trigget)',
      );
    } else {
      feedbackEmit.error(`Publisering feilet: ${response.status}`);
    }
  };

  const getFormsWithMottaksadresse = async (mottaksadresseId): Promise<NavFormType[]> => {
    return fetch(
      `${NavFormioJs.Formio.getProjectUrl()}/form?type=form&tags=nav-skjema&limit=1000&properties.mottaksadresseId=${mottaksadresseId}`,
      {
        method: 'GET',
      },
    ).then((forms) => forms.json());
  };

  useEffect(loadMottaksadresser, []);

  return {
    ready,
    errorMessage,
    mottaksadresser,
    loadMottaksadresser,
    deleteMottaksadresse,
    publishMottaksadresser,
  };
};

export default useMottaksadresser;
