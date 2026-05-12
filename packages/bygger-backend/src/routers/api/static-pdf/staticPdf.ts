import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { staticPdfService } from '../../../services';

const getAll: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const formPath = requestUtil.getStringParam(req, 'formPath')!;

  try {
    const allPdfs = await staticPdfService.getAll({
      formPath,
    });
    res.json(allPdfs);
  } catch (error) {
    next(error);
  }
};

const uploadPdf: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const formPath = requestUtil.getStringParam(req, 'formPath')!;
  const languageCode = req.params.languageCode as TranslationLang;

  try {
    const accessToken = requestUtil.getAzureAccessToken(req);
    const file = requestUtil.getFile(req);

    const pdf = await staticPdfService.uploadPdf({
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
  const formPath = requestUtil.getStringParam(req, 'formPath')!;
  const languageCode = req.params.languageCode as TranslationLang;

  try {
    const pdf = await staticPdfService.downloadPdf({
      formPath,
      languageCode,
    });

    res.json({ pdfBase64: pdf });
  } catch (error) {
    next(error);
  }
};

const deletePdf: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const formPath = requestUtil.getStringParam(req, 'formPath')!;
  const languageCode = req.params.languageCode as TranslationLang;

  try {
    const accessToken = requestUtil.getAzureAccessToken(req);

    await staticPdfService.deletePdf({
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
