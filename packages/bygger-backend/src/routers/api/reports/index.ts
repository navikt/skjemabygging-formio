import express from 'express';
import { adHandlers } from '../../../middleware/azureAd';
import report from './report';
import reports from './reports';

const reportsRouter = express.Router();

reportsRouter.all('*path', adHandlers.isAdmin);
reportsRouter.get('/', reports);
reportsRouter.get('/:reportId', report);

export default reportsRouter;
