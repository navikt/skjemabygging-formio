import { Router } from 'express';
import recipients from './recipients';

const recipientsRouter = Router();

recipientsRouter.get('/', recipients.getAll);
recipientsRouter.get('/:recipientId', recipients.get);

export default recipientsRouter;
