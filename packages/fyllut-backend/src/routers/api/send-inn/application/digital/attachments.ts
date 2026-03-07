import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { applicationService } from '../../../../../services';
import { HttpError } from '../../../../../utils/errors/HttpError';

const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { innsendingsId, attachmentId } = req.params;
    const accessToken = req.getTokenxAccessToken();
    const file = req.file;

    if (!file?.buffer) {
      return res.status(400).json({ message: 'Error: Ingen fil sendt med forespørselen' });
    }

    const result = await applicationService.uploadFile(file, accessToken, attachmentId, innsendingsId, 'digital');
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof HttpError && error.http_response_body.errorCode === 'temporarilyUnavailable') {
      return res.status(503).json({
        message: TEXTS.statiske.nologin.temporarilyUnavailable,
        errorCode: 'SERVICE_UNAVAILABLE',
      });
    }
    next(error);
  }
};

const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { innsendingsId, attachmentId, fileId } = req.params;
    const accessToken = req.getTokenxAccessToken();

    await applicationService.deleteFile(accessToken, innsendingsId, attachmentId, fileId, 'digital');
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export default {
  post,
  delete: deleteFile,
};
