import { requestUtil, staticPdfService } from '@navikt/skjemadigitalisering-shared-backend';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import config from '../../../config';

const { formsApi } = config;

const getAll: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { formPath } = req.params;

  try {
    const allPdfs = await staticPdfService.getAll({
      baseUrl: formsApi.url,
      formPath,
    });
    res.json(allPdfs);
  } catch (error) {
    next(error);
  }
};

const uploadPdf: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { formPath, languageCode } = req.params;

  try {
    const accessToken = requestUtil.getAzureAccessToken(req);
    const file = requestUtil.getFile(req);

    const pdf = await staticPdfService.uploadPdf({
      baseUrl: formsApi.url,
      formPath,
      languageCode,
      accessToken,
      file,
    });
    res.status(201).json(pdf);
  } catch (error) {
    next(error);
  }
};

const downloadPdf: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { formPath, languageCode } = req.params;

  try {
    const pdf = await staticPdfService.downloadPdf({
      baseUrl: formsApi.url,
      formPath,
      languageCode,
    });

    res.json({ pdfBase64: pdf });
  } catch (error) {
    next(error);
  }
};

const deletePdf: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { formPath, languageCode } = req.params;

  try {
    const accessToken = requestUtil.getAzureAccessToken(req);

    await staticPdfService.deletePdf({
      baseUrl: formsApi.url,
      formPath,
      languageCode,
      accessToken,
    });
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
