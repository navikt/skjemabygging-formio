import ecsFormat from "@elastic/ecs-winston-format";
import correlator from "express-correlation-id";
import { createLogger, format, transports } from "winston";

const correlationIdFormat = format((info) => {
  info.correlation_id = correlator.getId();
  return info;
});

export const logger = createLogger({
  level: process.env.FYLLUT_BACKEND_LOGLEVEL || "debug",
  format: format.combine(correlationIdFormat(), ecsFormat({ apmIntegration: false })),
  transports: [new transports.Console()],
});
