import { http } from 'msw';
import config from '../../../config';
import getRecipients from './resolvers/getRecipients';

const formsApiUrl = config.formsApi.url;

export const handlers = [http.get(`${formsApiUrl}/v1/recipients`, getRecipients)];
