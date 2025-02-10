import { index, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { RequestHandler } from 'express';
import { formPublicationsService } from '../../../services';
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
    const form = await formPublicationsService.post(
      formPath,
      languageCodes as TranslationLang[],
      parseInt(revision as string),
      accessToken,
    );
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
    const formioForm = index.mapFormToNavForm(form);

    req.body = { form: formioForm, translations: formioTranslations };
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

const formPublications = { getAll, get, post, getTranslations };

export default formPublications;
