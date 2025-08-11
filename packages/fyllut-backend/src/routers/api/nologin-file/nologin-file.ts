import { validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { config } from '../../../config/config';
import { logger } from '../../../logger';
import { responseToError } from '../../../utils/errorHandling';

const { sendInnConfig } = config;

const nologinFile = {
  post: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const vedleggId = req.query.vedleggId as string;
      const innsendingId = req.query.innsendingId as string | undefined;
      if (!req.file?.buffer) {
        return next(responseToError('Error: Ingen fil sendt med forespørselen', 'Ingen fil funnet', true));
      }

      const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });

      const form = new FormData();
      form.append('filinnhold', fileBlob, req.file?.originalname);
      Object.entries(req.body).forEach(([key, value]) => {
        form.append(key, value as string);
      });

      const accessToken = req.headers.AzureAccessToken as string;
      const targetUrl = `${sendInnConfig.host}${sendInnConfig.paths.nologinFile}?vedleggId=${vedleggId}${innsendingId ? `&innsendingId=${innsendingId}` : ''}`;
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      });
      if (response.ok) {
        res.status(response.status);
        res.json(await response.json());
      } else {
        logger.debug('Failed to upload file for user with no login');
        next(await responseToError(response, 'Feil ved opplasting av fil for uinnlogget søknad', true));
      }
    } catch (error) {
      next(error);
    }
  },
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filId = req.params.filId as string | undefined;
      const innsendingId = req.query.innsendingId as string;
      const vedleggId = req.query.vedleggId as string | undefined;
      if (!filId && !vedleggId) {
        logger.debug('Frontend must provide either filId or vedleggId to delete a file');
        return next(
          responseToError('Error: Ingen filId eller vedleggId angitt', 'Ingen filId eller vedleggId funnet', true),
        );
      }
      const targetUrl =
        filId && validatorUtils.isValidUuid(filId)
          ? `${sendInnConfig.host}${sendInnConfig.paths.nologinFile}/${filId}?innsendingId=${innsendingId}`
          : `${sendInnConfig.host}${sendInnConfig.paths.nologinFile}?vedleggId=${vedleggId}&innsendingId=${innsendingId}`;
      const response = await fetch(targetUrl, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${req.headers.AzureAccessToken as string}`,
        },
      });
      if (response.ok) {
        res.sendStatus(response.status);
      } else {
        logger.debug('Failed to delete file(s) for user with no login');
        next(await responseToError(response, 'Feil ved sletting av fil(er) for uinnlogget søknad', true));
      }
    } catch (error) {
      next(error);
    }
  },
};

export default nologinFile;
