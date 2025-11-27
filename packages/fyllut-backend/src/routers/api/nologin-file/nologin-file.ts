import { NextFunction, Request, Response } from 'express';
import { noLoginFileService } from '../../../services';

const nologinFile = {
  post: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const noLoginContext = req.getNologinContext();
      const attachmentId = req.query.attachmentId as string;
      const accessToken = req.headers.AzureAccessToken as string;
      const file = req.file;

      if (!file?.buffer) {
        return res.status(400).json({ message: 'Error: Ingen fil sendt med forespørselen' });
      }

      const result = await noLoginFileService.postFile(file, accessToken, attachmentId, noLoginContext?.innsendingsId);
      res.status(201).json(result);
    } catch (error: any) {
      console.log('!!!!!!!!!!!!!!!!');
      console.log(error);
      if (error['http_status'] === 403) {
        return res.status(403).json({
          message: 'Feil ved opplasting av fil for uinnlogget søknad, autorisering feilet',
        });
      } else if (error['http_status'] === 400) {
        return res.status(400).json({
          message: 'Feil ved opplasting av fil for uinnlogget søknad.',
          error_code: 'FILE_TOO_MANY_PAGES',
        });
      }

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
