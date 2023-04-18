import ecsFormat from "@elastic/ecs-morgan-format";
import correlator from "express-correlation-id";
import morgan from "morgan";
import { config } from "../config/config";
import { clean } from "../utils/logCleaning.js";

const { isTest } = config;

const INTERNAL_PATHS = /.*\/(internal|static)\/.*/i;
const httpRequestLogger = morgan(
  (tokens, req, res) => {
    const logEntry = JSON.parse(ecsFormat({ apmIntegration: false })(tokens, req, res));
    return JSON.stringify(
      clean({
        ...logEntry,
        level: res.statusCode < 500 ? "info" : "error",
        correlation_id: correlator.getId(),
      })
    );
  },
  {
    skip: (req) => isTest || INTERNAL_PATHS.test(req.originalUrl),
  }
);

export default httpRequestLogger;
