import {
  normalizeAttachmentCodeFilter,
  ResponseError,
  SendinnCoverPageRequest,
  sendinnLanguageUtils,
  Submission,
  validatorUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { Request, Response } from 'express';
import { sendinnCoverPageService } from '../../services';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const isSubmission = (value: unknown): value is Submission => isRecord(value) && isRecord(value.data);

const parseCoverPageRequest = (value: unknown): SendinnCoverPageRequest => {
  if (!isRecord(value) || typeof value.formPath !== 'string' || !validatorUtils.isValidFormPath(value.formPath)) {
    throw new ResponseError('BAD_REQUEST', 'Invalid form path');
  }
  if (typeof value.revision !== 'number' || !Number.isInteger(value.revision) || value.revision < 1) {
    throw new ResponseError('BAD_REQUEST', 'Invalid form revision');
  }
  const language = value.language ?? 'nb';
  if (typeof language !== 'string' || !sendinnLanguageUtils.isSupportedLanguage(language)) {
    throw new ResponseError('BAD_REQUEST', 'Unsupported language');
  }
  const filter = value.attachmentFilter;
  if (
    filter !== undefined &&
    typeof filter !== 'string' &&
    !(Array.isArray(filter) && filter.every((code): code is string => typeof code === 'string'))
  ) {
    throw new ResponseError('BAD_REQUEST', 'Invalid attachment filter');
  }
  if (!isSubmission(value.submission)) throw new ResponseError('BAD_REQUEST', 'Invalid submission');
  return {
    formPath: value.formPath,
    revision: value.revision,
    language,
    attachmentFilter: normalizeAttachmentCodeFilter(filter),
    submission: { data: value.submission.data },
  };
};

const downloadCoverPage = async (req: Request, res: Response) => {
  const result = await sendinnCoverPageService.downloadCoverPage(parseCoverPageRequest(req.body));
  res.setHeader('Cache-Control', 'no-store');
  res.json(result);
};

export { downloadCoverPage };
