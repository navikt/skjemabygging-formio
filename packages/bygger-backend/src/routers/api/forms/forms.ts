import { Form, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { RequestHandler } from 'express';
import { HttpError as OldHttpError } from '../../../fetchUtils';
import { formsService } from '../../../services';
import { HttpError } from '../helpers/errors';

const getAll: RequestHandler = async (req, res, next) => {
  const { select } = req.query;
  try {
    const allForms = await formsService.getAll(select?.toString());
    res.json(allForms);
  } catch (error) {
    next(error);
  }
};

const get: RequestHandler = async (req, res, next) => {
  const { formPath } = req.params;
  try {
    const form = await formsService.get(formPath);
    res.json(form);
  } catch (error) {
    next(error);
  }
};

const post: RequestHandler = async (req, res, next) => {
  const accessToken = req.headers.AzureAccessToken as string;
  const { skjemanummer, title, properties, components } = req.body as Form;
  const componentsWithNavIds = navFormUtils.enrichComponentsWithNavIds(components);
  const body = { skjemanummer, title, properties, components: componentsWithNavIds };
  try {
    const form = await formsService.post(body, accessToken);
    res.status(201).json(form);
  } catch (error) {
    if (error instanceof OldHttpError) {
      next(new HttpError(error.message, error.response.status));
    } else {
      next(error);
    }
  }
};

const put: RequestHandler = async (req, res, next) => {
  const accessToken = req.headers.AzureAccessToken as string;
  const { formPath } = req.params;
  const { revision, title, properties, components, introPage } = req.body as Form;
  const componentsWithNavIds = navFormUtils.enrichComponentsWithNavIds(components);
  const body = { title, properties, components: componentsWithNavIds, introPage };
  try {
    const form = await formsService.put(formPath, body, revision!, accessToken);
    res.json(form);
  } catch (error) {
    if (error instanceof OldHttpError) {
      next(new HttpError(error.message, error.response.status));
    } else {
      next(error);
    }
  }
};

const deleteForm: RequestHandler = async (req, res, next) => {
  const accessToken = req.headers.AzureAccessToken as string;
  const { formPath } = req.params;
  const { revision } = req.query;
  try {
    await formsService.deleteForm(formPath, parseInt(revision as string), accessToken);
    res.status(204).send();
  } catch (error) {
    if (error instanceof OldHttpError) {
      next(new HttpError(error.message, error.response.status));
    } else {
      next(error);
    }
  }
};

const postLockForm: RequestHandler = async (req, res, next) => {
  const accessToken = req.headers.AzureAccessToken as string;
  const { formPath } = req.params;
  const { reason } = req.body;
  try {
    const form = await formsService.postLockForm(formPath, reason, accessToken);
    res.json(form);
  } catch (error) {
    if (error instanceof OldHttpError) {
      next(new HttpError(error.message, error.response.status));
    } else {
      next(error);
    }
  }
};

const deleteLockForm: RequestHandler = async (req, res, next) => {
  const accessToken = req.headers.AzureAccessToken as string;
  const { formPath } = req.params;
  try {
    const form = await formsService.deleteLockForm(formPath, accessToken);
    res.json(form);
  } catch (error) {
    if (error instanceof OldHttpError) {
      next(new HttpError(error.message, error.response.status));
    } else {
      next(error);
    }
  }
};

const forms = {
  getAll,
  get,
  post,
  put,
  deleteForm,
  postLockForm,
  deleteLockForm,
};

export default forms;
