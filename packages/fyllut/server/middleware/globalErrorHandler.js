import correlator from "express-correlation-id";
import { config } from "../config/config.js";

const { skipLogging } = config;

const globalErrorHandler = (err, req, res, next) => {
  if (!err.correlation_id) {
    err.correlation_id = correlator.getId();
  }

  if (!skipLogging) {
    console.error(JSON.stringify(err));
  }

  res.status(500);
  res.contentType("application/json");
  res.send({ message: err.functional ? err.message : "Det oppstod en feil", correlation_id: err.correlation_id });
};

export default globalErrorHandler;
