import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { nologinService } from '../../../../../services';
import { HttpError } from '../../../../../utils/errors/HttpError';
import { validateNologinContext } from '../../../nologin-file/nologin-file';

const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const noLoginContext = validateNologinContext(req.getNologinContext());
    const innsendingsId = noLoginContext.innsendingsId;
    const attachmentId = req.params.attachmentId as string;
    const accessToken = req.headers.AzureAccessToken as string;
    const file = req.file;

    if (!file?.buffer) {
      return res.status(400).json({ message: 'Error: Ingen fil sendt med forespørselen' });
    }

    const result = await nologinService.postFile(file, accessToken, attachmentId, innsendingsId, 'nologin');
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof HttpError && error.http_status === 403) {
      return res.status(403).json({
        message: 'Feil ved opplasting av fil for uinnlogget søknad, autorisering feilet',
      });
    } else if (
      error instanceof HttpError &&
      error.http_status === 400 &&
      error.http_response_body.errorCode === 'illegalAction.fileWithTooManyPages'
    ) {
      return res.status(400).json({
        message: 'Feil ved opplasting av fil for uinnlogget søknad.',
        errorCode: 'FILE_TOO_MANY_PAGES',
      });
    } else if (error instanceof HttpError && error.http_response_body.errorCode === 'temporarilyUnavailable') {
      return res.status(503).json({
        message: TEXTS.statiske.nologin.temporarilyUnavailable,
        errorCode: 'SERVICE_UNAVAILABLE',
      });
    }
    next(error);
  }
};

const deleteAttachment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nologinContext = validateNologinContext(req.getNologinContext());
    const innsendingsId = nologinContext.innsendingsId;
    const attachmentId = req.params.attachmentId as string | undefined;
    const fileId = req.params.fileId as string | undefined;
    const accessToken = req.headers.AzureAccessToken as string;

    await nologinService.delete(accessToken, innsendingsId, attachmentId, fileId, 'nologin');
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export default {
  post,
  delete: deleteAttachment,
};
