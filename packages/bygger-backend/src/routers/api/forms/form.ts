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

const form = {
  get,
};

export default form;
