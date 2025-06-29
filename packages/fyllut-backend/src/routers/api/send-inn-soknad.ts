import { NextFunction, Request, Response } from 'express';
import fetch from 'node-fetch';
import { config } from '../../config/config';
import { logger } from '../../logger';
import { getIdportenPid, getTokenxAccessToken } from '../../security/tokenHelper';
import { base64Decode } from '../../utils/base64';
import { responseToError } from '../../utils/errorHandling';
import { getFyllutUrl } from '../../utils/url';
import {
  assembleSendInnSoknadBody,
  byteArrayToObject,
  isNotFound,
  sanitizeInnsendingsId,
  SendInnSoknadBody,
  validateInnsendingsId,
} from './helpers/sendInn';

const { sendInnConfig } = config;
const getErrorMessage = 'Kan ikke hente mellomlagret søknad.';
const postErrorMessage = 'Kan ikke starte mellomlagring av søknaden.';
const putErrorMessage = 'Kan ikke oppdatere mellomlagret søknad.';
const deleteErrorMessage = 'Kan ikke slette mellomlagret søknad.';

const sendInnSoknad = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenxAccessToken = getTokenxAccessToken(req);

      const sanitizedInnsendingsId = sanitizeInnsendingsId(req.params.innsendingsId);
      const errorMessage = validateInnsendingsId(sanitizedInnsendingsId, getErrorMessage);
      if (errorMessage) {
        return res.sendStatus(404);
      }

      const sendInnResponse = await fetch(
        `${sendInnConfig.host}${sendInnConfig.paths.soknad}/${sanitizedInnsendingsId}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${tokenxAccessToken}`,
            'x-innsendingId': sanitizedInnsendingsId,
          },
        },
      );

      if (!sendInnResponse.ok) {
        const responseError = await responseToError(
          sendInnResponse,
          `Feil ved kall til SendInn. ${getErrorMessage}`,
          true,
        );
        if (isNotFound(sendInnResponse, responseError)) {
          logger.info(`${sanitizedInnsendingsId}: Not found. Failed to get`, responseError);
          return res.sendStatus(404);
        }

        logger.debug('Failed to fetch data from SendInn');
        return next(responseError);
      }

      logger.debug('Successfylly fetched data from SendInn');
      const json = (await sendInnResponse.json()) as SendInnSoknadBody;
      const response = {
        ...json,
        hoveddokumentVariant: {
          ...json.hoveddokumentVariant,
          ...(json.hoveddokumentVariant.document && {
            document: byteArrayToObject(base64Decode(json.hoveddokumentVariant.document)),
          }),
        },
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  },
  post: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idportenPid = getIdportenPid(req);
      const tokenxAccessToken = getTokenxAccessToken(req);
      const fyllutUrl = getFyllutUrl(req);
      const body = assembleSendInnSoknadBody(req.body, idportenPid, fyllutUrl, null);
      const forceCreateParam = req.query?.forceMellomlagring ? '?force=true' : '';
      const envQualifier = req.getEnvQualifier();

      const sendInnResponse = await fetch(`${sendInnConfig.host}${sendInnConfig.paths.soknad}${forceCreateParam}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenxAccessToken}`,
          ...(envQualifier && { 'Nav-Env-Qualifier': envQualifier }),
        },
        body: JSON.stringify(body),
      });

      if (sendInnResponse.ok) {
        logger.debug(sendInnResponse.status === 200 ? 'User has active tasks' : 'Successfylly posted data to SendInn');
        res.status(sendInnResponse.status);
        res.json(await sendInnResponse.json());
      } else {
        logger.debug('Failed to post data to SendInn');
        next(await responseToError(sendInnResponse, `Feil ved kall til SendInn. ${postErrorMessage}`, true));
      }
    } catch (err) {
      next(err);
    }
  },

  put: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idportenPid = getIdportenPid(req);
      const tokenxAccessToken = getTokenxAccessToken(req);
      const fyllutUrl = getFyllutUrl(req);

      const { innsendingsId } = req.body;

      const sanitizedInnsendingsId = sanitizeInnsendingsId(innsendingsId);
      const errorMessage = validateInnsendingsId(sanitizedInnsendingsId, putErrorMessage);
      if (errorMessage) {
        next(new Error(errorMessage));
        return;
      }
      const body = assembleSendInnSoknadBody(req.body, idportenPid, fyllutUrl, null);

      const sendInnResponse = await fetch(
        `${sendInnConfig.host}${sendInnConfig.paths.soknad}/${sanitizedInnsendingsId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenxAccessToken}`,
            'x-innsendingId': sanitizedInnsendingsId,
          },
          body: JSON.stringify(body),
        },
      );

      if (sendInnResponse.ok) {
        logger.debug('Successfylly updated data in SendInn');
        res.json(await sendInnResponse.json());
      } else {
        const responseError = await responseToError(
          sendInnResponse,
          `Feil ved kall til SendInn. ${putErrorMessage}`,
          true,
        );
        if (isNotFound(sendInnResponse, responseError)) {
          logger.info(`${sanitizedInnsendingsId}: Not found. Failed to update`, responseError);
          return res.sendStatus(404);
        }

        logger.debug('Failed to update data in SendInn');
        next(responseError);
      }
    } catch (err) {
      next(err);
    }
  },
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenxAccessToken = getTokenxAccessToken(req);

      const sanitizedInnsendingsId = sanitizeInnsendingsId(req.params.innsendingsId);
      const errorMessage = validateInnsendingsId(sanitizedInnsendingsId, deleteErrorMessage);
      if (errorMessage) {
        next(new Error(errorMessage));
        return;
      }

      const sendInnResponse = await fetch(
        `${sendInnConfig.host}${sendInnConfig.paths.soknad}/${sanitizedInnsendingsId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenxAccessToken}`,
            'x-innsendingId': sanitizedInnsendingsId,
          },
        },
      );

      if (sendInnResponse.ok) {
        logger.debug(`Successfylly deleted soknad with innsendingsId ${sanitizedInnsendingsId}`);
        const json = await sendInnResponse.json();
        res.json(json);
      } else {
        const responseError = await responseToError(
          sendInnResponse,
          `Feil ved kall til SendInn. ${deleteErrorMessage}`,
          true,
        );
        if (isNotFound(sendInnResponse, responseError)) {
          logger.info(`${sanitizedInnsendingsId}: Not found. Failed to delete`, responseError);
          return res.sendStatus(404);
        }

        logger.debug(`Failed to delete soknad with innsendingsId ${sanitizedInnsendingsId}`);
        next(responseError);
      }
    } catch (err) {
      next(err);
    }
  },
};

export default sendInnSoknad;
