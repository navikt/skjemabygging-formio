import ecsFormat from "@elastic/ecs-morgan-format";
import correlator from "express-correlation-id";
import morgan from "morgan";
import { config } from "../config/config";
import { clean } from "../utils/logCleaning.js";

const { isTest } = config;

const INTERNAL_PATHS = /.*\/(internal|static)\/.*/i;
const httpRequestLogger = morgan(
  (token, req, res) => {
    const logEntry = JSON.parse(ecsFormat({ apmIntegration: false })(token, req, res));
    logEntry.correlation_id = correlator.getId();
    return JSON.stringify(clean(logEntry));
  },
  {
    skip: (req) => isTest || INTERNAL_PATHS.test(req.originalUrl),
  }
);

export default httpRequestLogger;
