import { Router } from 'express';
import { initApiConfig } from '../api-helper';
import activities from './activities';

const registerDataRouter = Router();
const { tokenxTilleggsstonader } = initApiConfig();

registerDataRouter.get('/activities', tokenxTilleggsstonader, activities.get);

export default registerDataRouter;
