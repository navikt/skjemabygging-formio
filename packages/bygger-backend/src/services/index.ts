import { Backend } from '../Backend';
import config from '../config';
import { getFormioApiProdServiceUrl, getFormioApiServiceUrl } from '../util/formio';
import { createCopyService } from './copy/CopyService';
import { FormioService } from './formioService';
import PublisherService from './PublisherService';
import PusherService from './PusherService';
import { RecipientService } from './RecipientService';
import ReportService from './ReportService';

const formioApiServiceUrl = getFormioApiServiceUrl();
const prodFormioApiServiceUrl = getFormioApiProdServiceUrl();

const formioService = new FormioService(formioApiServiceUrl);

const recipientService = new RecipientService(config.formsApi.url);

const backendInstance = new Backend(config, formioService);

const publisherService = new PublisherService(formioService, backendInstance);

const reportService = new ReportService(formioService);

const pusherService = new PusherService();

const copyService = prodFormioApiServiceUrl
  ? createCopyService(new FormioService(prodFormioApiServiceUrl), formioService)
  : null;

export {
  backendInstance,
  copyService,
  formioService,
  publisherService,
  pusherService,
  recipientService,
  reportService,
};
