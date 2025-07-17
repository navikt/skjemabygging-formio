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
        logger.debug('Failed to get activities from SendInn');
        next(await responseToError(response, 'Feil ved opplasting av fil for uinnlogget søknad', true));
      }
    } catch (error) {
      next(error);
    }
  },
};

export default nologinFile;
