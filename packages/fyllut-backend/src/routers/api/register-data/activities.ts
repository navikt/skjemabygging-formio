import { NextFunction, Request, Response } from 'express';
import fetch from 'node-fetch';
import { ParsedUrlQueryInput } from 'querystring';
import url from 'url';
import { config } from '../../../config/config';
import { logger } from '../../../logger';
import { getTokenxAccessToken } from '../../../security/tokenHelper';
import { responseToError } from '../../../utils/errorHandling';
import { ActivityResponse, mapActivityResponse } from './utils';

const { tilleggsstonaderConfig } = config;

const activities = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenxAccessToken = getTokenxAccessToken(req);
      const activitiesResponse = await fetch(
        url.format({
          pathname: `${tilleggsstonaderConfig.host}${tilleggsstonaderConfig.paths.activities}`,
          query: req.query as ParsedUrlQueryInput,
        }),
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
        res.json(mapActivityResponse((await activitiesResponse.json()) as ActivityResponse));
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
