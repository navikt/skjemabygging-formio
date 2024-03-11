import { SendInnAktivitet } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import fetch from 'node-fetch';
import { config } from '../../../../config/config';
import { logger } from '../../../../logger';
import { getTokenxAccessToken } from '../../../../security/tokenHelper';
import { responseToError } from '../../../../utils/errorHandling';

const { sendInnConfig } = config;

const sendInnActivities = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenxAccessToken = getTokenxAccessToken(req);

      const activitiesResponse = await fetch(
        `${sendInnConfig.host}${sendInnConfig.paths.activities}?type=${req.query.type ?? 'aktivitet'}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenxAccessToken}`,
          },
        },
      );

      if (activitiesResponse.ok) {
        res.status(activitiesResponse.status);
        res.json((await activitiesResponse.json()) as SendInnAktivitet[]);
      } else {
        logger.debug('Failed to get activities from SendInn');
        next(await responseToError(activitiesResponse, 'Feil ved kall til SendInn for aktiviteter', true));
      }
    } catch (err) {
      next(err);
    }
  },
};

export default sendInnActivities;
