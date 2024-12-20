import { HttpResponse } from 'msw';
import { logger } from '../../../../logging/logger';

const putTranslation = async ({ request, params }) => {
  const { id: submissionId } = params;
  logger.info(`[MSW] PUT language submission id=${submissionId}`);
  const submission = await request.json();
  return HttpResponse.json(submission, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
};

export default putTranslation;
