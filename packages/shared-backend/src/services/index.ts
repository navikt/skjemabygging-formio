import applicationPdfService from './application-pdf/applicationPdfService';
import coverPageService from './cover-page/coverPageService';
import { coverPageMapper } from './cover-page/mapper';
import formService from './form/formService';
import mergeFileService from './merge-file/mergeFileService';
import recipientService from './recipient/recipientService';
import staticPdfService from './static-pdf/staticPdfService';
import translationService from './translation/translationService';
export type { ForstesideRequestBody } from './cover-page/coverPageRequestTypes';

export {
  applicationPdfService,
  coverPageMapper,
  coverPageService,
  formService,
  mergeFileService,
  recipientService,
  staticPdfService,
  translationService,
};
