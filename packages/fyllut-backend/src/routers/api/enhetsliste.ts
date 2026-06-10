import { correlator } from '@navikt/skjemadigitalisering-shared-backend';
import { supportedEnhetstyper } from '@navikt/skjemadigitalisering-shared-domain';
import { Request, Response } from 'express';
import { navUnitService } from '../../services';
import { HttpError } from '../../utils/errors/HttpError';

const isEnhetstypeSupported = (enhet) => enhet.enhetNr !== '0000' && supportedEnhetstyper.includes(enhet.type);
const pickRelevantProps = (enhet) => {
  const { enhetId, navn, enhetNr, type } = enhet;
  return { enhetId, navn, enhetNr, type };
};

const createEnhetslisteError = () => {
  const error = new HttpError('Feil ved henting av enhetsliste');
  error.functional = true;
  error.correlation_id = correlator.getId();
  return error;
};

const enhetsliste = {
  get: async (_req: Request, res: Response) => {
    let navUnits;
    try {
      navUnits = await navUnitService.getNavUnits();
    } catch {
      throw createEnhetslisteError();
    }

    return res.json(navUnits.filter(isEnhetstypeSupported).map(pickRelevantProps));
  },
};

export default enhetsliste;
