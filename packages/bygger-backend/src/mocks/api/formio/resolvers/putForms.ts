import { HttpResponse } from 'msw';
import { logger } from '../../../../logging/logger';
import { mswUtils } from '../../../index';

const putForms = async ({ request, params }) => {
  const requestBody = await request.json();
  mswUtils.record({ method: request.method, url: request.url, body: requestBody });
  const mockResponse = mswUtils.find(request.url, request.method);
  if (mockResponse) {
    const { status, body } = mockResponse;
    return new HttpResponse(body, { status });
  }
  const { id } = params;
  logger.info(`[MSW] PUT form id=${id}`);
  return HttpResponse.json(requestBody, { status: 200 });
};

export default putForms;
