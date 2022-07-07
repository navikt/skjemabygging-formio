import config from "../config";
import backendInstance from "../routers/api/helpers/backend-instance";
import { FormioService } from "./formioService";
import PublisherService from "./PublisherService";

const formioService = new FormioService(config.formio.projectUrl);

const publisherService = new PublisherService(formioService, backendInstance);

export { formioService, publisherService };
