import ecsFormat from "@elastic/ecs-morgan-format";
import correlator from "express-correlation-id";
import morgan from "morgan";
import { clean } from "../utils/logCleaning.js";

const INTERNAL_PATHS = /.*\/(internal|static)\/.*/i;
const httpRequestLogger = morgan(
  (token, req, res) => {
    const logEntry = JSON.parse(ecsFormat({ apmIntegration: false })(token, req, res));
    logEntry.correlation_id = correlator.getId();
    return JSON.stringify(clean(logEntry));
  },
  {
    skip: (req) => {
      return INTERNAL_PATHS.test(req.originalUrl);
    },
  }
);

export default httpRequestLogger;
