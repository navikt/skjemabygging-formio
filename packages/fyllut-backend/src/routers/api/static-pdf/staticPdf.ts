import { NextFunction, Request, Response } from 'express';
import staticPdfService from '../../../services/staticPdf/staticPdfService';

const staticPdf = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { formPath } = req.params;

      const result = await staticPdfService.getAll(formPath);
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  },
  downloadPdf: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { formPath, languageCode } = req.params;

      const result = await staticPdfService.downloadPdf(formPath, languageCode);
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  },
};

export default staticPdf;
