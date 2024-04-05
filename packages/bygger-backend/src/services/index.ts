import { Backend } from '../Backend';
import config from '../config';
import PublisherService from './PublisherService';
import PusherService from './PusherService';
import ReportService from './ReportService';
import { createCopyService } from './copy/CopyService';
import { FormioService } from './formioService';

const formioService = new FormioService(config.formio.projectUrl);

const backendInstance = new Backend(config, formioService);

const publisherService = new PublisherService(formioService, backendInstance);

const reportService = new ReportService(formioService);

const pusherService = new PusherService();

const copyService = config.prodFormio?.projectUrl
  ? createCopyService(new FormioService(config.prodFormio.projectUrl), formioService)
  : null;

export { backendInstance, copyService, formioService, publisherService, pusherService, reportService };
