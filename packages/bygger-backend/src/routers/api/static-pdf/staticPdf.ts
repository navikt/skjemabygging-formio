import { RequestHandler } from 'express';
import { staticPdfService } from '../../../services';

const getAll: RequestHandler = async (req, res, next) => {
  const accessToken = req.headers.AzureAccessToken as string;
  const { formPath } = req.params;

  try {
    const allRecipients = await staticPdfService.getAll(formPath, accessToken);
    res.json(allRecipients);
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
    const recipient = await staticPdfService.uploadPdf(file, formPath, languageCode, accessToken);

    console.log(recipient);
    res.status(201).json(recipient);
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

const recipients = {
  getAll,
  uploadPdf,
  deletePdf,
};

export default recipients;
