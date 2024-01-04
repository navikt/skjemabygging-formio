import { RequestHandler } from 'express';
import { formioService } from '../../../services';

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
