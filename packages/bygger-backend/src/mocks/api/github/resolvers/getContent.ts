import { HttpResponse } from 'msw';
import { stringTobase64 } from '../../../../fetchUtils';
import { logger } from '../../../../logging/logger';
import { loadPublishedForm } from '../data/loaders';

// example: forms%2Fnav12345.json
const CONTENTS_PATH_REGEX = /(.*)\/(.*)\.(.*)/;

type Contents = { folder: string; fileName: string; extension: string };

function extractContentsInfo(path: string | null): Contents | undefined {
  const matches = path ? CONTENTS_PATH_REGEX.exec(path) : null;
  return matches
    ? {
        folder: matches[1],
        fileName: matches[2],
        extension: matches[3],
      }
    : undefined;
}

const getContent = async ({ params }) => {
  const { path } = params;
  if (path) {
    logger.info(`[MSW] Fetching Github content: ${path}`);
    const contentsInfo = extractContentsInfo(path);
    const formPath = contentsInfo?.fileName;
    const publishedForm = formPath ? await loadPublishedForm(formPath) : undefined;
    if (publishedForm) {
      logger.info(`[MSW] Returning Github content for ${path}`);
      const content = stringTobase64(JSON.stringify(publishedForm));
      return HttpResponse.json({ content }, { status: 200 });
    }
  }
  logger.info(`[MSW] Github content not found: ${path}`);
  return HttpResponse.text(null, { status: 404 });
};

export default getContent;
