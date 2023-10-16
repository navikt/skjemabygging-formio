import express from 'express';
import authorizedPusher from '../../middleware/authorizedPusher';
import apiErrorHandler from '../api/helpers/apiErrorHandler';
import pusher from './pusher';

const notificationsRouter = express.Router();

notificationsRouter.post('/', authorizedPusher, pusher.post);
notificationsRouter.use(apiErrorHandler);

export default notificationsRouter;
