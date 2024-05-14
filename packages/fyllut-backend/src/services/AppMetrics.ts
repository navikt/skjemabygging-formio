import { Counter, Histogram, collectDefaultMetrics, register as defaultRegister } from 'prom-client';
import { logger } from '../logger';

class AppMetrics {
  private readonly _exstreamPdfRequestsCounter: Counter;
  private readonly _exstreamPdfFailuresCounter: Counter;
  private readonly _outgoingRequestDuration: Histogram;

  constructor() {
    logger.info('Initializing metrics client');

    this._exstreamPdfRequestsCounter = new Counter({
      name: 'fyllut_exstream_pdf_requests_total',
      help: 'Number of exstream pdf requests',
      labelNames: [],
    });

    this._exstreamPdfFailuresCounter = new Counter({
      name: 'fyllut_exstream_pdf_failures_total',
      help: 'Number of exstream pdf requests which failed',
      labelNames: [],
    });

    this._outgoingRequestDuration = new Histogram({
      name: 'fyllut_outgoing_request_duration_seconds',
      help: 'Request duration for outgoing requests made by FyllUt',
      labelNames: ['service', 'method', 'error'],
      buckets: [0.7, 0.8, 0.9, 1.0, 1.2, 1.5, 2.0, 5.0, 15.0],
    });
    this._outgoingRequestDuration.zero({ service: 'exstream', method: 'createPdf', error: 'false' });
    this._outgoingRequestDuration.zero({ service: 'exstream', method: 'createPdf', error: 'true' });

    collectDefaultMetrics();
  }

  public get register() {
    return defaultRegister;
  }

  public get exstreamPdfRequestsCounter() {
    return this._exstreamPdfRequestsCounter;
  }

  public get exstreamPdfFailuresCounter() {
    return this._exstreamPdfFailuresCounter;
  }

  public get outgoingRequestDuration() {
    return this._outgoingRequestDuration;
  }
}

export default AppMetrics;
