import { NextFunction, Request, Response } from 'express';
import { noLoginFileService } from '../../../services';
import { FunctionalError } from '../../../utils/errors/FunctionalError';

const nologinFile = {
  post: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const noLoginContext = req.getNologinContext();
      const attachmentId = req.query.attachmentId as string;
      const accessToken = req.headers.AzureAccessToken as string;
      const file = req.file;

      if (!file?.buffer) {
        return next(new FunctionalError('Error: Ingen fil sendt med forespørselen', true));
      }

      const result = await noLoginFileService.postFile(file, accessToken, attachmentId, noLoginContext?.innsendingsId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nologinContext = req.getNologinContext();
      const attachmentId = req.query.attachmentId as string | undefined;
      const fileId = req.params.fileId as string | undefined;
      const accessToken = req.headers.AzureAccessToken as string;

      await noLoginFileService.delete(accessToken, nologinContext?.innsendingsId, attachmentId, fileId);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
};

export default nologinFile;
