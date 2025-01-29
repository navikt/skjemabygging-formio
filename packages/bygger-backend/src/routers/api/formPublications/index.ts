import express from 'express';
import authHandlers from '../helpers/authHandlers';
import publishForm from '../publish-form';
import formPublications from './formPublications';

const formPublicationsRouter = express.Router();
const { formsApiAuthHandler } = authHandlers;

formPublicationsRouter.get('/', formPublications.getAll);
formPublicationsRouter.get('/:formPath', formPublications.get);
formPublicationsRouter.post('/:formPath', formsApiAuthHandler, formPublications.post, publishForm);
formPublicationsRouter.get('/:formPath/translations', formPublications.getTranslations);

export default formPublicationsRouter;
