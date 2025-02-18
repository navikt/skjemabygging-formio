import { FormsApiFormTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { RequestHandler } from 'express';
import { HttpError as OldHttpError } from '../../../fetchUtils';
import { formTranslationsService } from '../../../services';
import { HttpError } from '../helpers/errors';

const get: RequestHandler = async (req, res, next) => {
  const { formPath } = req.params;
  try {
    const translations = await formTranslationsService.get(formPath);
    res.json(translations);
  } catch (error) {
    next(error);
  }
};

const post: RequestHandler = async (req, res, next) => {
  const { formPath } = req.params;
  const accessToken = req.headers.AzureAccessToken as string;
  const { key, nb, nn, en, globalTranslationId } = req.body as FormsApiFormTranslation;
  const body = globalTranslationId ? { key, globalTranslationId } : { key, nb, nn, en };
  try {
    const translation = await formTranslationsService.post(formPath, body, accessToken);
    res.status(201).json(translation);
  } catch (error) {
    if (error instanceof OldHttpError) {
      next(new HttpError(error.message, error.response.status));
    } else {
      next(error);
    }
  }
};

const put: RequestHandler = async (req, res, next) => {
  const { formPath, id } = req.params;
  const { revision, nb, nn, en, globalTranslationId } = req.body as FormsApiFormTranslation;
  const accessToken = req.headers.AzureAccessToken as string;
  const body = globalTranslationId ? { globalTranslationId } : { nb, nn, en };
  try {
    const translation = await formTranslationsService.put(formPath, id, body, revision!, accessToken);
    res.json(translation);
  } catch (error) {
    if (error instanceof OldHttpError) {
      next(new HttpError(error.message, error.response.status));
    } else {
      next(error);
    }
  }
};

const deleteTranslation: RequestHandler = async (req, res, next) => {
  const { formPath, id } = req.params;
  const accessToken = req.headers.AzureAccessToken as string;
  try {
    await formTranslationsService.delete(formPath, parseInt(id), accessToken);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

const formTranslations = {
  get,
  post,
  put,
  delete: deleteTranslation,
};
export default formTranslations;
