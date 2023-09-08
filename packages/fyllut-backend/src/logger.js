import correlator from "express-correlation-id";
import { createLogger, format, transports } from "winston";

const correlationIdFormat = format((info) => {
  info.correlation_id = correlator.getId();
  return info;
});

export const logger = createLogger({
  level: process.env.FYLLUT_BACKEND_LOGLEVEL || (process.env.NODE_ENV === "test" ? "warning" : "info"),
  format: format.combine(correlationIdFormat(), format.json()),
  transports: [new transports.Console()],
});
