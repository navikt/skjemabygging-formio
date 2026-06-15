import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../logger';
import { getTokenxAccessToken } from '../../../../security/tokenHelper';
import { prefillService } from '../../../../services';

const prefillErrorMessage = 'Feil ved kall til SendInn for preutfylling';

const sendInnPrefillData = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = getTokenxAccessToken(req);
      const properties = typeof req.query?.properties === 'string' ? req.query.properties : undefined;
      const data = await prefillService.getPrefillData({ accessToken, properties });
      res.json(data);
    } catch (error) {
      if (error instanceof ResponseError) {
        logger.debug('Failed to get prefill data from SendInn');
        return next(new ResponseError(error.errorCode, prefillErrorMessage, error.correlationId, prefillErrorMessage));
      }
      next(error);
    }
  },
};

export default sendInnPrefillData;
