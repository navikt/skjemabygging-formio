import { Backend } from '../Backend';
import config from '../config';
import { getFormioApiServiceUrl } from '../util/formio';
import { createCopyService } from './copy/CopyService';
import { FormioService } from './formioService';
import createFormPublicationsService from './formPublications/FormPublicationsService';
import createFormsService from './forms/FormsService';
import PublisherService from './PublisherService';
import PusherService from './PusherService';
import RecipientService from './RecipientService';
import ReportService from './ReportService';
import createFormTranslationsService from './translation/FormTranslationService';
import createGlobalTranslationService from './translation/GlobalTranslationsService';

const formioApiServiceUrl = getFormioApiServiceUrl();

const formioService = new FormioService(formioApiServiceUrl);

const recipientService = new RecipientService(config.formsApi.url);

const backendInstance = new Backend(config, formioService);

const publisherService = new PublisherService(backendInstance);

const pusherService = new PusherService();

const formTranslationsService = createFormTranslationsService(config.formsApi.url);

const globalTranslationsService = createGlobalTranslationService(config.formsApi.url);

const formsService = createFormsService(config.formsApi.url);

const formPublicationsService = createFormPublicationsService(config.formsApi.url);

const reportService = new ReportService(formsService, formPublicationsService);

const prodFormsApiUrl = config.prodFormsApi?.url;
const copyService = prodFormsApiUrl
  ? createCopyService(
      createFormsService(prodFormsApiUrl),
      formsService,
      createFormTranslationsService(prodFormsApiUrl),
      formTranslationsService,
      createGlobalTranslationService(prodFormsApiUrl),
      globalTranslationsService,
    )
  : null;

export {
  backendInstance,
  copyService,
  formioService,
  formPublicationsService,
  formsService,
  formTranslationsService,
  globalTranslationsService,
  publisherService,
  pusherService,
  recipientService,
  reportService,
};
