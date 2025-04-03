import { Activity } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import fetch from 'node-fetch';
import { config } from '../../../config/config';
import { logger } from '../../../logger';
import { getTokenxAccessToken } from '../../../security/tokenHelper';
import { responseToError } from '../../../utils/errorHandling';

const { tilleggsstonaderConfig } = config;

const activities = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenxAccessToken = getTokenxAccessToken(req);
      const activitiesResponse = await fetch(
        `${tilleggsstonaderConfig.host}${tilleggsstonaderConfig.paths.activities}?stønadstype=BOUTGIFTER`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenxAccessToken}`,
          },
        },
      );

      logger.info(`Hentet aktiviteter fra Tilleggsstonader med status ${activitiesResponse.status}`);

      if (activitiesResponse.ok) {
        res.status(activitiesResponse.status);
        res.json((await activitiesResponse.json()) as Activity[]);
      } else {
        logger.debug('Failed to get activities from Tilleggsstonader');
        next(await responseToError(activitiesResponse, 'Feil ved kall til Tilleggsstonader for aktiviteter', true));
      }
    } catch (err) {
      next(err);
    }
  },
};

export default activities;
