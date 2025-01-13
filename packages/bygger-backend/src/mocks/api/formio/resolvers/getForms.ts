import { HttpResponse } from 'msw';
import { logger } from '../../../../logging/logger';
import { mswUtils } from '../../../index';
import { loadAllForms, loadForm } from '../data/loaders';

const getForms = async ({ request }) => {
  const mockResponse = mswUtils.find(request.url.split('?').shift(), 'GET');
  if (mockResponse) {
    const { status, body } = mockResponse;
    return HttpResponse.json(body, { status });
  }
  const url = new URL(request.url);
  const formPath = url.searchParams.get('path');
  if (formPath) {
    logger.info(`[MSW] Loading form ${formPath}...`);
    const form = await loadForm(formPath);
    if (form) {
      logger.info(`[MSW] form title: ${form.title}`);
      return HttpResponse.json([form]);
    }
    logger.info(`[MSW] Form not found: ${formPath}...`);
    return HttpResponse.json([]);
  }
  const forms = await loadAllForms();
  logger.info(`[MSW] loaded all ${forms.length} forms`);
  return HttpResponse.json(forms);
};

export default getForms;
