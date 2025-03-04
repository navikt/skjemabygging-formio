import { formioFormsApiUtils, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { RequestHandler } from 'express';
import { logger } from '../../../logging/logger';
import { formPublicationsService, formsService } from '../../../services';
import { FormPublicationId } from '../../../services/formPublications/types';
import { BadRequest } from '../helpers/errors';
import { mapLanguageCodeToFormioFormat } from './utils';

const getAll: RequestHandler = async (req, res, next) => {
  try {
    const allPublishedForms = await formPublicationsService.getAll();
    res.json(allPublishedForms);
  } catch (error) {
    next(error);
  }
};

const get: RequestHandler = async (req, res, next) => {
  const { formPath } = req.params;
  try {
    const form = await formPublicationsService.get(formPath);
    res.json(form);
  } catch (error) {
    next(error);
  }
};

const post: RequestHandler = async (req, res, next) => {
  const { formPath } = req.params;
  const { languageCodes, revision } = req.query; // TODO
  const accessToken = req.headers.AzureAccessToken as string;

  try {
    logger.info(`Publishing form ${formPath}...`);
    const form = await formPublicationsService.post(
      formPath,
      languageCodes as TranslationLang[],
      parseInt(revision as string),
      accessToken,
    );
    logger.info(`Form ${formPath} published successfully`);
    const { translations } = await formPublicationsService.getTranslations(
      formPath,
      languageCodes as TranslationLang[],
    );
    const formioTranslations = Object.fromEntries(
      Object.entries(translations).map(([key, values]) => [
        mapLanguageCodeToFormioFormat(key as TranslationLang),
        values,
      ]),
    );
    const formioForm = formioFormsApiUtils.mapFormToNavForm(form);

    req.body = { form: formioForm, translations: formioTranslations, formsApiForm: form };
    next();
  } catch (error) {
    next(error);
  }
};

const postBulk: RequestHandler = async (req, res, next) => {
  const { formPaths } = req.body.payload;
  const accessToken = req.headers.AzureAccessToken as string;

  if (!Array.isArray(formPaths) || formPaths.length === 0) {
    next(new BadRequest('Request is missing formPaths'));
    return;
  }

  try {
    const allForms = await formsService.getAll('path,revision');
    const formPublicationIds: FormPublicationId[] = allForms
      .filter((form) => formPaths.includes(form.path))
      .map((form) => ({ path: form.path, revision: form.revision! }));
    logger.info(`Bulk-publishing ${formPublicationIds.length}...`, { formPaths });

    const bulkPublicationResult = await formPublicationsService.postAll(formPublicationIds, accessToken);
    const successCounter = bulkPublicationResult.filter((r) => r.status === 'ok');
    const failureCounter = bulkPublicationResult.filter((r) => r.status !== 'ok');
    logger.info(`Published ${successCounter} forms (failed: ${failureCounter})`, { bulkPublicationResult });

    req.body = { bulkPublicationResult };
    next();
  } catch (error) {
    next(error);
  }
};

const unpublish: RequestHandler = async (req, _res, next) => {
  try {
    const { formPath } = req.params;
    const accessToken = req.headers.AzureAccessToken as string;
    await formPublicationsService.unpublish(formPath, accessToken);
    const form = await formsService.get(formPath);
    req.body = { formsApiForm: form };
    next();
  } catch (error) {
    next(error);
  }
};

const getTranslations = async (req, res, next) => {
  const { formPath } = req.params;
  const { languageCodes } = req.query;
  try {
    const translations = await formPublicationsService.getTranslations(formPath, languageCodes);
    res.json(translations);
  } catch (error) {
    next(error);
  }
};

const formPublications = { getAll, get, post, postBulk, delete: unpublish, getTranslations };

export default formPublications;
