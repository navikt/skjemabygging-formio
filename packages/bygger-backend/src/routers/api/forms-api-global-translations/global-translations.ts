import {
  formioFormsApiUtils,
  FormsApiTranslation,
  GlobalTranslationsResourceContent,
} from '@navikt/skjemadigitalisering-shared-domain';
import { RequestHandler } from 'express';
import { HttpError as OldHttpError } from '../../../fetchUtils';
import { backendInstance, globalTranslationsService } from '../../../services';
import { HttpError } from '../helpers/errors';

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
  const { key, tag, nb, nn, en } = req.body as FormsApiTranslation;
  const body = { key, tag, nb, nn, en };
  try {
    const translation = await globalTranslationsService.post(body, accessToken);
    res.status(204).json(translation);
  } catch (error) {
    if (error instanceof OldHttpError) {
      next(new HttpError(error.message, error.response.status));
    } else {
      next(error);
    }
  }
};

const put: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const { revision, nb, nn, en } = req.body as FormsApiTranslation;
  const accessToken = req.headers.AzureAccessToken as string;
  const body = { nb, nn, en };
  try {
    const translation = await globalTranslationsService.put(id, body, revision!, accessToken);
    res.json(translation);
  } catch (error) {
    if (error instanceof OldHttpError) {
      next(new HttpError(error.message, error.response.status));
    } else {
      next(error);
    }
  }
};

const deleteTranslation = async (req, res, next) => {
  const { id } = req.params;
  const accessToken = req.headers.AzureAccessToken as string;
  try {
    await globalTranslationsService.delete(id, accessToken);
    res.sendStatus(204);
  } catch (error) {
    if (error instanceof OldHttpError) {
      next(new HttpError(error.message, error.response.status));
    } else {
      next(error);
    }
  }
};

const publish: RequestHandler = async (req, res, next) => {
  try {
    const accessToken = req.headers.AzureAccessToken as string;
    await globalTranslationsService.publish(accessToken);

    const publishedTranslations = await globalTranslationsService.getPublished(['nn', 'en'], accessToken);
    const { en, 'nn-NO': nn }: GlobalTranslationsResourceContent =
      formioFormsApiUtils.mapPublishedGlobalTranslationsToFormioFormat(publishedTranslations);

    await backendInstance.publishResource('global-translations-en', { en });
    await backendInstance.publishResource('global-translations-nn-NO', { 'nn-NO': nn });

    res.sendStatus(201);
  } catch (error) {
    if (error instanceof OldHttpError) {
      next(new HttpError(error.message, error.response.status));
    } else {
      next(error);
    }
  }
};

const globalTranslations = {
  get,
  post,
  put,
  publish,
  delete: deleteTranslation,
};
export default globalTranslations;
