import { Router } from 'express';
import recipients from './recipients';

const recipientsRouter = Router();

recipientsRouter.get('/', recipients.getAll);
recipientsRouter.get('/:recipientId', recipients.get);
recipientsRouter.post('/', recipients.post);
recipientsRouter.put('/:recipientId', recipients.put);
recipientsRouter.delete('/:recipientId', recipients.deleteRecipient);

export default recipientsRouter;
