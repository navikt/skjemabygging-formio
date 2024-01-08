import { RequestHandler } from 'express';
import { formioService } from '../../../services';
import { BadRequest } from '../helpers/errors';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const isValidObjectId = (formId: string | undefined) => (formId ? OBJECT_ID_REGEX.test(formId) : false);

const get: RequestHandler = async (req, res, next) => {
  try {
    const { formPath } = req.params;
    const form = await formioService.getForm(formPath);
    if (form) {
      res.json(form);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    next(error);
  }
};

const put: RequestHandler = async (req, res, next) => {
  try {
    const form = req.body;
    if (!isValidObjectId(form._id)) {
      next(new BadRequest(`Invalid form id: '${form._id}'`));
      return;
    }
    const formioToken = req.getFormioToken?.();
    const userName = req.getUser?.().name;
    const savedForm = await formioService.saveForm(form, formioToken, userName, {}, true);
    res.json(savedForm);
  } catch (error) {
    next(error);
  }
};

const form = {
  get,
  put,
};

export default form;
