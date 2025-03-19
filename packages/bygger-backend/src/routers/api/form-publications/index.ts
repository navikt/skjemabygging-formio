import express from 'express';
import authHandlers from '../helpers/authHandlers';
import publishForm from '../publish-form';
import publishForms from '../publish-forms';
import unpublishForm from '../unpublish-form';
import formPublications from './form-publications';

const formPublicationsRouter = express.Router();
const { formsApiAuthHandler } = authHandlers;

formPublicationsRouter.get('/', formPublications.getAll);
formPublicationsRouter.post('/', formsApiAuthHandler, formPublications.postBulk, publishForms);
formPublicationsRouter.get('/:formPath', formPublications.get);
formPublicationsRouter.post('/:formPath', formsApiAuthHandler, formPublications.post, publishForm);
formPublicationsRouter.delete('/:formPath', formsApiAuthHandler, formPublications.delete, unpublishForm);
formPublicationsRouter.get('/:formPath/translations', formPublications.getTranslations);

export default formPublicationsRouter;
