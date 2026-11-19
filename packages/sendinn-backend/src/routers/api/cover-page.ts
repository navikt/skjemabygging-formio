import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { Submission, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { Request, Response } from 'express';
import { sendinnCoverPageService } from '../../services';

const downloadCoverPage = async (req: Request, res: Response) => {
  const result = await sendinnCoverPageService.downloadCoverPage({
    formPath: requestUtil.getBodyValue<string>(req, 'formPath'),
    revision: requestUtil.getBodyValue<number>(req, 'revision'),
    language: requestUtil.getBodyValue<TranslationLang>(req, 'language', true) ?? 'nb',
    attachmentFilter: requestUtil.getBodyValue<string[]>(req, 'attachmentFilter', true) ?? [],
    submission: requestUtil.getBodyValue<Submission>(req, 'submission'),
  });
  res.setHeader('Cache-Control', 'no-store');
  res.json(result);
};

export { downloadCoverPage };
