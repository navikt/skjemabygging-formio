import { supportedEnhetstyper } from '@navikt/skjemadigitalisering-shared-domain';
import { Request, Response } from 'express';
import { navUnitService } from '../../services';

const isEnhetstypeSupported = (enhet) => enhet.enhetNr !== '0000' && supportedEnhetstyper.includes(enhet.type);
const pickRelevantProps = (enhet) => {
  const { enhetId, navn, enhetNr, type } = enhet;
  return { enhetId, navn, enhetNr, type };
};

const enhetsliste = {
  get: async (_req: Request, res: Response) => {
    const navUnits = await navUnitService.getNavUnits();

    return res.json(navUnits.filter(isEnhetstypeSupported).map(pickRelevantProps));
  },
};

export default enhetsliste;
