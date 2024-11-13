import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { RequestHandler } from 'express';
import { globalTranslationsService } from '../../../services';

const get: RequestHandler = async (req, res, next) => {
  try {
    const translations = await globalTranslationsService.get();
    res.json(translations);
  } catch (error) {
    next(error);
  }
};

const post: RequestHandler = async (req, res, next) => {
  const accessToken = req.headers.AzureAccessToken as string;
  try {
    const translation = await globalTranslationsService.post(req.body, accessToken);
    res.status(201).json(translation);
  } catch (error) {
    next(error);
  }
};

const put: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const { revision, nb, nn, en } = req.body as FormsApiGlobalTranslation;
  const accessToken = req.headers.AzureAccessToken as string;
  const body = { nb, nn, en };
  try {
    const translation = await globalTranslationsService.put(id, body, revision!, accessToken);
    res.json(translation);
  } catch (error) {
    next(error);
  }
};

const globalTranslations = {
  get,
  post,
  put,
};
export default globalTranslations;
