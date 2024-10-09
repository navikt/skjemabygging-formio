import { RequestHandler } from 'express';
import { recipientService } from '../../../services';

const getAll: RequestHandler = async (req, res, next) => {
  try {
    const allRecipients = await recipientService.getAll();
    res.json(allRecipients);
  } catch (error) {
    next(error);
  }
};

const get: RequestHandler = async (req, res, next) => {
  try {
    const { recipientId } = req.params;
    const recipient = await recipientService.get(recipientId);
    res.json(recipient);
  } catch (error) {
    next(error);
  }
};

const recipients = {
  getAll,
  get,
};
export default recipients;
