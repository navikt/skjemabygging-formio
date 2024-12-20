import { HttpResponse } from 'msw';
import { logger } from '../../../logging/logger';

const optionsResolver = ({ request }) => {
  logger.info(`[MSW] Options response 204 (${request.url})`);
  return HttpResponse.text(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
      'Access-Control-Allow-Headers': '*',
    },
  });
};

export default optionsResolver;
