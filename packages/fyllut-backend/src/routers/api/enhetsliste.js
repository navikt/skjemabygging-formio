import { correlator } from '@navikt/skjemadigitalisering-shared-backend';
import { supportedEnhetstyper } from '@navikt/skjemadigitalisering-shared-domain';
import fetch from 'node-fetch';
import { config } from '../../config/config';
import { toJsonOrThrowError } from '../../utils/errorHandling';

const { norg2, clientId } = config;

const isEnhetstypeSupported = (enhet) => enhet.enhetNr !== '0000' && supportedEnhetstyper.includes(enhet.type);
const pickRelevantProps = (enhet) => {
  const { enhetId, navn, enhetNr, type } = enhet;
  return { enhetId, navn, enhetNr, type };
};

const enhetsliste = {
  get: (req, res, next) => {
    return fetch(`${norg2.url}/norg2/api/v1/enhet?enhetStatusListe=AKTIV`, {
      headers: {
        'x-correlation-id': correlator.getId(),
        consumerId: clientId,
      },
    })
      .then(toJsonOrThrowError('Feil ved henting av enhetsliste', true))
      .then((enhetsliste) => res.json(enhetsliste.filter(isEnhetstypeSupported).map(pickRelevantProps)))
      .catch((error) => {
        next(error);
      });
  },
};

export default enhetsliste;
