import { Counter, Histogram, Registry, collectDefaultMetrics } from "prom-client";
import { logger } from "../logger";

class AppMetrics {
  _register: Registry = new Registry();

  constructor() {
    logger.info("Initializing metrics client");
    collectDefaultMetrics({ register: this._register });
  }

  public get register() {
    return this._register;
  }

  public exstreamPdfRequestsCounter = new Counter({
    name: "fyllut_exstream_pdf_requests_total",
    help: "Number of exstream pdf requests",
    labelNames: ["formPath", "submissionMethod"],
    registers: [this._register],
  });

  public exstreamPdfFailuresCounter = new Counter({
    name: "fyllut_exstream_pdf_failures_total",
    help: "Number of exstream pdf requests which failed",
    labelNames: ["formPath", "submissionMethod"],
    registers: [this._register],
  });

  public outgoingRequestDuration = new Histogram({
    name: "fyllut_outgoing_request_duration_seconds",
    help: "Request duration for outgoing requests made by FyllUt",
    labelNames: ["service", "method", "error"],
    buckets: [1.0, 2.0, 5.0, 10.0, 15.0, 30.0, 60.0],
    registers: [this._register],
  });
}

export default AppMetrics;
