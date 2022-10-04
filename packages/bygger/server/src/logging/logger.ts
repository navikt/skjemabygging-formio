import ecsFormat from "@elastic/ecs-winston-format";
import correlator from "express-correlation-id";
import { createLogger, format, transports } from "winston";

const correlationIdFormat = format((info) => {
  info.correlation_id = correlator.getId();
  return info;
});

export const logger = createLogger({
  level: process.env.BYGGER_BACKEND_LOGLEVEL || "info",
  silent: process.env.NODE_ENV === "test",
  format: format.combine(correlationIdFormat(), ecsFormat({ apmIntegration: false })),
  transports: [new transports.Console()],
});
