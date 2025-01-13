import { HttpResponse } from 'msw';
import { logger } from '../../../../logging/logger';
import { loadTranslations } from '../data/loaders';

// query param example: ?data.name__regex=/^global(.nav123456)*$/gi
const DATA_NAME_REGEX = /\(\.(.*)\)/;

function extractFormPath(nameRegex: string | null) {
  const matches = nameRegex ? DATA_NAME_REGEX.exec(nameRegex) : null;
  return matches ? matches[1] : undefined;
}

const getTranslations = async ({ request }) => {
  const url = new URL(request.url);
  const globalTranslations = (await loadTranslations('globalTranslations')) || [];

  const nameRegex = url.searchParams.get('data.name__regex');
  const formPath = extractFormPath(nameRegex);
  if (formPath) {
    logger.info(`[MSW] Returning translations for form ${formPath}`);
    const formTranslations = (await loadTranslations(formPath)) || [];
    return HttpResponse.json([...globalTranslations, ...formTranslations], {
      status: 200,
      headers: { 'access-control-allow-origin': '*' },
    });
  }
  logger.info(`[MSW] Returning only global translations`);
  return HttpResponse.json([...globalTranslations], { status: 200, headers: { 'access-control-allow-origin': '*' } });
};

export default getTranslations;
