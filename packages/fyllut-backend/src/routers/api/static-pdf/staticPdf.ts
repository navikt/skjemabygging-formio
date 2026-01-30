import { staticPdfService } from '@navikt/skjemadigitalisering-shared-backend';
import { NextFunction, Request, Response } from 'express';
import { config } from '../../../config/config';

const { formsApiUrl } = config;

const staticPdf = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { formPath } = req.params;

      const result = await staticPdfService.getAll(formsApiUrl, formPath);
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  },
  downloadPdf: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { formPath, languageCode } = req.params;

      const result = await staticPdfService.downloadPdf(formsApiUrl, formPath, languageCode);
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  },
};

export default staticPdf;
