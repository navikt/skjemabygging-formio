import { HttpResponse } from 'msw';
import { logger } from '../../../../logging/logger';
import { loadAllForms, loadForm } from '../data/loaders';

const getForms = async ({ request }) => {
  const url = new URL(request.url);
  const formPath = url.searchParams.get('path');
  if (formPath) {
    logger.info(`[MSW] Loading form ${formPath}...`);
    const form = await loadForm(formPath);
    if (form) {
      return HttpResponse.json([form], { status: 200 });
    }
    logger.info(`[MSW] Form not found: ${formPath}...`);
    return HttpResponse.json([], { status: 200 });
  }
  const forms = await loadAllForms();
  return HttpResponse.json(forms, { status: 200 });
};

export default getForms;
