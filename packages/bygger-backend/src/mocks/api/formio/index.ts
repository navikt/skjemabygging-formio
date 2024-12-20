import { http } from 'msw';
import { getFormioApiServiceUrl } from '../../../util/formio';
import getCurrentUser from './resolvers/getCurrentUser';
import getForms from './resolvers/getForms';
import getTranslations from './resolvers/getTranslations';
import putForms from './resolvers/putForms';
import putTranslation from './resolvers/putTranslation';

const formioApiServiceUrl = getFormioApiServiceUrl();

export const handlers = [
  http.get(`${formioApiServiceUrl}/current`, getCurrentUser),
  http.get(`${formioApiServiceUrl}/form`, getForms),
  http.put(`${formioApiServiceUrl}/form/:id`, putForms),
  http.get(`${formioApiServiceUrl}/language/submission`, getTranslations),
  http.put(`${formioApiServiceUrl}/language/submission/:id`, putTranslation),
];
