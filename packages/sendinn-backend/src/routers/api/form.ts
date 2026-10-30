import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import {
  normalizeSendinnAttachmentFilter,
  ResponseError,
  sendinnLanguageUtils,
  validatorUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { Request, Response } from 'express';
import { sendinnFormService } from '../../services';

const getForm = async (req: Request, res: Response) => {
  const formPath = requestUtil.getStringParam(req, 'formPath')!;
  if (!validatorUtils.isValidFormPath(formPath)) {
    throw new ResponseError('BAD_REQUEST', 'Invalid form path');
  }
  const language = req.query.lang ?? 'nb';
  if (typeof language !== 'string' || !sendinnLanguageUtils.isSupportedLanguage(language)) {
    throw new ResponseError('BAD_REQUEST', 'Unsupported language');
  }
  const filter = req.query.filter;
  if (
    filter !== undefined &&
    typeof filter !== 'string' &&
    !(Array.isArray(filter) && filter.every((value) => typeof value === 'string'))
  ) {
    throw new ResponseError('BAD_REQUEST', 'Invalid attachment filter');
  }

  const result = await sendinnFormService.getForm({
    formPath,
    language,
    attachmentFilter: normalizeSendinnAttachmentFilter(filter as string | string[] | undefined),
  });
  res.setHeader('Cache-Control', 'no-store');
  res.json(result);
};

export { getForm };
