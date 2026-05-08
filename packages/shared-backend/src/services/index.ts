import applicationPdfService from './application-pdf/applicationPdfService';
import coverPageApiService from './cover-page/coverPageApiService';
import coverPageService from './cover-page/coverPageService';
import { coverPageMapper } from './cover-page/mapper';
import formService from './form/formService';
import mergeFileService from './merge-file/mergeFileService';
import recipientService from './recipient/recipientService';
import staticPdfService from './static-pdf/staticPdfService';
import translationService from './translation/translationService';
export type {
  ForstesideRecipientAddress,
  ForstesideRequestBody,
  KjentBruker,
  UkjentBruker,
} from './cover-page/foersteside';

export {
  applicationPdfService,
  coverPageApiService,
  coverPageMapper,
  coverPageService,
  formService,
  mergeFileService,
  recipientService,
  staticPdfService,
  translationService,
};
