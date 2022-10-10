import { Backend } from "../Backend";
import config from "../config";
import { FormioService } from "./formioService";
import PublisherService from "./PublisherService";
import PusherService from "./PusherService";
import ReportService from "./ReportService";

const formioService = new FormioService(config.formio.projectUrl);

const backendInstance = new Backend(config, formioService);

const publisherService = new PublisherService(formioService, backendInstance);

const reportService = new ReportService(formioService);

const pusherService = new PusherService();

export { formioService, publisherService, pusherService, reportService, backendInstance };
