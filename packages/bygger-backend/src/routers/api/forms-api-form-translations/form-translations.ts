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
  console.log('POST', formPath, req.body);
  try {
    const translation = await formTranslationsService.post(formPath, req.body, accessToken);
    console.log(translation);
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
  const body = { nb, nn, en, globalTranslationId };
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

const formTranslations = {
  get,
  post,
  put,
};
export default formTranslations;
