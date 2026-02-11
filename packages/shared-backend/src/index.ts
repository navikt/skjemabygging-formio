import correlator from 'express-correlation-id';
import errorHandler from './middleware/error/errorHandler';
import paramValidation from './middleware/error/paramValidation';
import coverPageService from './services/cover-page/coverPageService';
import formService from './services/form/formService';
import mergeFileService from './services/merge-file/mergeFileService';
import staticPdfService from './services/static-pdf/staticPdfService';
import translationService from './services/translation/translationService';
import fileUtil from './util/file/fileUtil';
import requestUtil from './util/request/requestUtil';
import urlUtil from './util/url/urlUtil';

export {
  // Middleware
  correlator,
  // Services
  coverPageService,
  errorHandler,
  // Utils
  fileUtil,
  formService,
  mergeFileService,
  paramValidation,
  requestUtil,
  staticPdfService,
  translationService,
  urlUtil,
};
