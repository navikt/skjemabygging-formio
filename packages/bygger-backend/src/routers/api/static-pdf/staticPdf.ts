import { RequestHandler } from 'express';
import { staticPdfService } from '../../../services';

const getAll: RequestHandler = async (req, res, next) => {
  const accessToken = req.headers.AzureAccessToken as string;
  const { formPath } = req.params;

  try {
    const allPdfs = await staticPdfService.getAll(formPath, accessToken);
    res.json(allPdfs);
  } catch (error) {
    next(error);
  }
};

const uploadPdf: RequestHandler = async (req, res, next) => {
  const accessToken = req.headers.AzureAccessToken as string;
  const { formPath, languageCode } = req.params;
  const file = req.file;

  if (!file?.buffer) {
    return res.status(400).json({ message: 'Error: Ingen fil sendt med forespørselen' });
  }

  try {
    const pdf = await staticPdfService.uploadPdf(file, formPath, languageCode, accessToken);
    res.status(201).json(pdf);
  } catch (error) {
    next(error);
  }
};

const downloadPdf: RequestHandler = async (req, res, next) => {
  const accessToken = req.headers.AzureAccessToken as string;
  const { formPath, languageCode } = req.params;

  try {
    const pdf = await staticPdfService.downloadPdf(formPath, languageCode, accessToken);
    if (pdf) {
      res.status(200).json({ pdfBase64: pdf });
    } else {
      res.status(404).json({ message: 'PDF not found' });
    }
  } catch (error) {
    next(error);
  }
};

const deletePdf: RequestHandler = async (req, res, next) => {
  const accessToken = req.headers.AzureAccessToken as string;
  const { formPath, languageCode } = req.params;

  try {
    await staticPdfService.deletePdf(formPath, languageCode, accessToken);
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
