import { validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { config } from '../../../config/config';
import { logger } from '../../../logger';
import { responseToError } from '../../../utils/errorHandling';

const { sendInnConfig } = config;

const nologinFile = {
  post: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const attachmentId = req.query.attachmentId as string;
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
      const targetUrl = `${sendInnConfig.host}${sendInnConfig.paths.nologinFile}?vedleggId=${attachmentId}${innsendingId ? `&innsendingId=${innsendingId}` : ''}`;
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      });
      if (response.ok) {
        res.status(response.status);
        const { filId, vedleggId, innsendingId, filnavn, storrelse } = await response.json();
        res.json({
          fileId: filId,
          attachmentId: vedleggId,
          innsendingId,
          fileName: filnavn,
          size: storrelse,
        });
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
      const fileId = req.params.fileId as string | undefined;
      const innsendingId = req.query.innsendingId as string;
      const attachmentId = req.query.attachmentId as string | undefined;
      if (!fileId && !attachmentId) {
        logger.debug('Frontend must provide either fileId or attachmentId to delete a file');
        return next(
          responseToError(
            'Error: Ingen fileId eller attachmentId angitt',
            'Ingen fileId eller attachmentId funnet',
            true,
          ),
        );
      }
      const targetUrl =
        fileId && validatorUtils.isValidUuid(fileId)
          ? `${sendInnConfig.host}${sendInnConfig.paths.nologinFile}/${fileId}?innsendingId=${innsendingId}`
          : `${sendInnConfig.host}${sendInnConfig.paths.nologinFile}?vedleggId=${attachmentId}&innsendingId=${innsendingId}`;
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
