import { RequestHandler } from 'express';
import { formioService } from '../../../services';

const get: RequestHandler = async (req, res, next) => {
  try {
    const { select } = req.query;
    const allForms = await formioService.getAllForms(1000, true, select as string);
    res.json(allForms);
  } catch (error) {
    next(error);
  }
};

const forms = {
  get,
};

export default forms;
