import winston from "winston";
export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      timestamp: true,
      format: winston.format.json(),
    }),
  ],
});
