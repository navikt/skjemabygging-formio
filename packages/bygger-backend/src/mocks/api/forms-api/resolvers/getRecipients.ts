import { HttpResponse } from 'msw';
import { logger } from '../../../../logging/logger';
import { loadData } from '../data/loaders';

const getRecipients = async () => {
  logger.info('[MSW] Return all recipients');
  const forms = await loadData('recipients/all-recipients');
  return HttpResponse.json(forms, { status: 200 });
};

export default getRecipients;
