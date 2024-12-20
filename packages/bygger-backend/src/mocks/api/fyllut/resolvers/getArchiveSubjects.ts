import { HttpResponse } from 'msw';
import { logger } from '../../../../logging/logger';
import { loadData } from '../data/loaders';

const getRecipients = async () => {
  logger.info('[MSW] Return all recipients');
  const archiveSubjects = await loadData('archive-subjects/all-archive-subjects');
  return HttpResponse.json(archiveSubjects, { status: 200 });
};

export default getRecipients;
