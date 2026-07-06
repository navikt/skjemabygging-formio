import { Router } from 'express';
import tryCatch from '../../../middleware/tryCatch';
import { initApiConfig } from '../api-helper';
import activities from './activities';

const registerDataRouter = Router();
const { tokenxTilleggsstonader } = initApiConfig();

registerDataRouter.get('/activities', tokenxTilleggsstonader, tryCatch(activities.get));

export default registerDataRouter;
