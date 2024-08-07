import { NextFunction, Request, Response } from 'express';
import fetch from 'node-fetch';
import { config } from '../../../../config/config';
import { logger } from '../../../../logger';
import { getTokenxAccessToken } from '../../../../security/tokenHelper';
import { responseToError } from '../../../../utils/errorHandling';

const { sendInnConfig } = config;

const sendInnPrefillData = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenxAccessToken = getTokenxAccessToken(req);
      const propertiesParam = req.query?.properties ? `properties=${req.query.properties}` : '';

      const sendInnResponse = await fetch(
        `${sendInnConfig.host}${sendInnConfig.paths.prefillData}?${propertiesParam}`,
        {
          method: 'GET',
          redirect: 'manual',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenxAccessToken}`,
          },
        },
      );

      if (sendInnResponse.ok) {
        res.status(sendInnResponse.status);
        res.json(await sendInnResponse.json());
      } else {
        logger.debug('Failed to get prefill data from SendInn');
        next(await responseToError(sendInnResponse, 'Feil ved kall til SendInn for preutfylling', true));
      }
    } catch (err) {
      next(err);
    }
  },
};

export default sendInnPrefillData;
