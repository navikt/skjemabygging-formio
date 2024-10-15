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

const post: RequestHandler = async (req, res, next) => {
  const accessToken = req.headers.AzureAccessToken as string;
  try {
    const recipient = await recipientService.post(req.body, accessToken);
    res.json(recipient);
  } catch (error) {
    next(error);
  }
};

const put: RequestHandler = async (req, res, next) => {
  const { recipientId } = req.params;
  const accessToken = req.headers.AzureAccessToken as string;
  try {
    const recipient = await recipientService.put(recipientId, req.body, accessToken);
    res.json(recipient);
  } catch (error) {
    next(error);
  }
};

const deleteRecipient: RequestHandler = async (req, res, next) => {
  const { recipientId } = req.params;
  const accessToken = req.headers.AzureAccessToken as string;
  try {
    await recipientService.delete(recipientId, accessToken);
    res.end();
  } catch (error) {
    next(error);
  }
};

const recipients = {
  getAll,
  get,
  post,
  put,
  deleteRecipient,
};
export default recipients;
