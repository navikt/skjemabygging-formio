import { staticPdfService } from '@navikt/skjemadigitalisering-shared-backend';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import config from '../../../config';

const { formsApi } = config;

const getAll: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { formPath } = req.params;

  try {
    const allPdfs = await staticPdfService.getAll(formsApi.url, formPath);
    res.json(allPdfs);
  } catch (error) {
    next(error);
  }
};

const uploadPdf: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers.AzureAccessToken as string;
  const { formPath, languageCode } = req.params;
  const file = req.file;

  try {
    const pdf = await staticPdfService.uploadPdf(formsApi.url, formPath, languageCode, accessToken, file);
    res.status(201).json(pdf);
  } catch (error) {
    next(error);
  }
};

const downloadPdf: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { formPath, languageCode } = req.params;

  try {
    const pdf = await staticPdfService.downloadPdf(formsApi.url, formPath, languageCode);
    res.json(pdf);
  } catch (error) {
    next(error);
  }
};

const deletePdf: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers.AzureAccessToken as string;
  const { formPath, languageCode } = req.params;

  try {
    await staticPdfService.deletePdf(formsApi.url, formPath, languageCode, accessToken);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const staticPdf = {
  getAll,
  uploadPdf,
  downloadPdf,
  deletePdf,
};

export default staticPdf;
