import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { RequestHandler } from 'express';
import { HttpError as OldHttpError } from '../../../fetchUtils';
import { formsService } from '../../../services';
import { HttpError } from '../helpers/errors';

const getAll: RequestHandler = async (req, res, next) => {
  const { select } = req.query;
  console.log('select', select, select?.toString());
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
  const body = { skjemanummer, title, properties, components };
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
  const { revision, title, properties, components } = req.body as Form;
  const body = { title, properties, components };
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

const forms = {
  getAll,
  get,
  post,
  put,
};

export default forms;
