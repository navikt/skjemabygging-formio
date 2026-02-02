import { requestUtil, staticPdfService } from '@navikt/skjemadigitalisering-shared-backend';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import config from '../../../config';

const { formsApi } = config;

const getAll: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const formPath = requestUtil.getStringParam('formPath', req);
    const allPdfs = await staticPdfService.getAll(formsApi.url, formPath);
    res.json(allPdfs);
  } catch (error) {
    next(error);
  }
};

const uploadPdf: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = requestUtil.getAccessToken(req);
    const formPath = requestUtil.getStringParam('formPath', req);
    const languageCode = requestUtil.getStringParam('languageCode', req);
    const file = requestUtil.getFile(req);

    const pdf = await staticPdfService.uploadPdf(formsApi.url, formPath, languageCode, accessToken, file);
    res.status(201).json(pdf);
  } catch (error) {
    next(error);
  }
};

const downloadPdf: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const formPath = requestUtil.getStringParam('formPath', req);
    const languageCode = requestUtil.getStringParam('languageCode', req);

    const pdf = await staticPdfService.downloadPdf(formsApi.url, formPath, languageCode);
    res.json(pdf);
  } catch (error) {
    next(error);
  }
};

const deletePdf: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = requestUtil.getAccessToken(req);
    const formPath = requestUtil.getStringParam('formPath', req);
    const languageCode = requestUtil.getStringParam('languageCode', req);

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
