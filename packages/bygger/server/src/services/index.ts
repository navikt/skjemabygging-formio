import { Backend } from "../Backend";
import config from "../config";
import { FormioService } from "./formioService";
import PublisherService from "./PublisherService";

const formioService = new FormioService(config.formio.projectUrl);

const backendInstance = new Backend(config, formioService);

const publisherService = new PublisherService(formioService, backendInstance);

export { formioService, publisherService, backendInstance };
