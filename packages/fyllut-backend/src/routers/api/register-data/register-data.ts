import { Router } from 'express';
import tryCatch from '../../../middleware/tryCatch';
import activities from './activities';

const registerDataRouter = Router();

registerDataRouter.get('/activities', tryCatch(activities.get));

export default registerDataRouter;
