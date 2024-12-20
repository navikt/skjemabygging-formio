import { HttpResponse } from 'msw';
import { logger } from '../../../../logging/logger';

const putForms = async ({ request, params }) => {
  const { id } = params;
  logger.info(`[MSW] PUT form id=${id}`);
  const requestBody = await request.json();
  return HttpResponse.json(requestBody, { status: 200 });
};

export default putForms;
