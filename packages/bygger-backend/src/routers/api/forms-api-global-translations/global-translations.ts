import {
  FormsApiGlobalTranslation,
  GlobalTranslationsResourceContent,
} from '@navikt/skjemadigitalisering-shared-domain';
import { RequestHandler } from 'express';
import { HttpError as OldHttpError } from '../../../fetchUtils';
import { backendInstance, globalTranslationsService } from '../../../services';
import { HttpError } from '../helpers/errors';
import { mapGlobalToFormioFormat } from './utils/mapToFormioFormat';

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
  const { key, tag, nb, nn, en } = req.body as FormsApiGlobalTranslation;
  const body = { key, tag, nb, nn, en };
  try {
    const translation = await globalTranslationsService.post(body, accessToken);
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
  const { id } = req.params;
  const { revision, nb, nn, en } = req.body as FormsApiGlobalTranslation;
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

const publish: RequestHandler = async (req, res, next) => {
  try {
    const accessToken = req.headers.AzureAccessToken as string;
    await globalTranslationsService.publish(accessToken);

    const translations = await globalTranslationsService.get();
    const { en, 'nn-NO': nn }: GlobalTranslationsResourceContent = mapGlobalToFormioFormat(translations);
    const resultEnglish = await backendInstance.publishResource('global-translations-en', { en });
    const resultNynorsk = await backendInstance.publishResource('global-translations-nn-NO', { 'nn-NO': nn });

    console.log(resultEnglish);
    console.log(resultNynorsk);

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
};
export default globalTranslations;
