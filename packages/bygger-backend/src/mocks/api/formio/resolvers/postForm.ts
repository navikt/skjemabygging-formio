import { HttpResponse } from 'msw';
import { logger } from '../../../../logging/logger';
import { mswUtils } from '../../../index';

const postForm = async ({ request }) => {
  const mockResponse = mswUtils.find(request.url, 'POST');
  if (mockResponse) {
    const { status, body } = mockResponse;
    return new HttpResponse(body, { status });
  }
  const requestBody = await request.json();
  logger.info(`[MSW] POST form ("${requestBody.title}")`);
  return HttpResponse.json(requestBody, { status: 200 });
};

export default postForm;
