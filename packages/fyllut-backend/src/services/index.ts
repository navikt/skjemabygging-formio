import AppMetrics from "./AppMetrics";
import FormService from "./FormService";

const formService = new FormService();

const appMetrics: AppMetrics = new AppMetrics();

export { formService, appMetrics };
