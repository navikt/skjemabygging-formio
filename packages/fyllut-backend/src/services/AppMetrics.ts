import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';
import { logger } from '../logger';

class AppMetrics {
  private readonly _register: Registry;
  private readonly _familiePdfRequestsCounter: Counter;
  private readonly _familiePdfFailuresCounter: Counter;
  private readonly _paperSubmissionsCounter: Counter;
  private readonly _outgoingRequestDuration: Histogram;
  private readonly _innsendingApiUploadFileSize: Histogram;
  private readonly _innsendingApiUploadDuration: Histogram;
  private readonly _expressJsonBodyParserDuration: Histogram;
  private readonly _idportenVerifyTokenDuration: Histogram;
  private readonly _nologinCaptchaRequestsCounter: Counter;
  private readonly _nologinCaptchaFailuresCounter: Counter;

  constructor() {
    logger.info('Initializing metrics client');

    this._register = new Registry();

    this._familiePdfRequestsCounter = new Counter({
      name: 'fyllut_familie_pdf_requests_total',
      help: 'Number of familie pdf requests',
      labelNames: [],
      registers: [this._register],
    });

    this._familiePdfFailuresCounter = new Counter({
      name: 'fyllut_familie_pdf_failures_total',
      help: 'Number of familie pdf requests which failed',
      labelNames: [],
      registers: [this._register],
    });

    this._paperSubmissionsCounter = new Counter({
      name: 'fyllut_paper_submissions_total',
      help: 'Number of generated pdfs for paper submission',
      labelNames: ['source'],
      registers: [this._register],
    });
    // initialize all label values to 0
    this._paperSubmissionsCounter.inc({ source: 'fyllUt' }, 0);
    this._paperSubmissionsCounter.inc({ source: 'ettersending' }, 0);
    this._paperSubmissionsCounter.inc({ source: 'lospost' }, 0);
    this._paperSubmissionsCounter.inc({ source: 'ingen' }, 0);
    this._paperSubmissionsCounter.inc({ source: '-' }, 0);

    this._nologinCaptchaRequestsCounter = new Counter({
      name: 'fyllut_nologin_captcha_requests_total',
      help: 'Number of nologin captcha requests',
      labelNames: [],
      registers: [this._register],
    });

    this._nologinCaptchaFailuresCounter = new Counter({
      name: 'fyllut_nologin_captcha_failures_total',
      help: 'Number of nologin captcha requests which failed',
      labelNames: [],
      registers: [this._register],
    });

    this._outgoingRequestDuration = new Histogram({
      name: 'fyllut_outgoing_request_duration_seconds',
      help: 'Request duration for outgoing requests made by FyllUt',
      labelNames: ['service', 'method', 'error'],
      buckets: [0.7, 0.8, 0.9, 1.0, 1.2, 1.5, 2.0, 5.0, 15.0],
      registers: [this._register],
    });
    this._outgoingRequestDuration.zero({ service: 'familiepdf', method: 'createPdf', error: 'false' });
    this._outgoingRequestDuration.zero({ service: 'familiepdf', method: 'createPdf', error: 'true' });

    this._innsendingApiUploadFileSize = new Histogram({
      name: 'fyllut_innsending_api_upload_file_size_bytes',
      help: 'Size of files uploaded to innsending-api in bytes',
      labelNames: ['type', 'error'],
      buckets: [
        64 * 1024,
        128 * 1024,
        256 * 1024,
        512 * 1024,
        1024 * 1024,
        2 * 1024 * 1024,
        5 * 1024 * 1024,
        10 * 1024 * 1024,
        20 * 1024 * 1024,
        50 * 1024 * 1024,
        100 * 1024 * 1024,
        150 * 1024 * 1024,
      ],
      registers: [this._register],
    });
    this._innsendingApiUploadFileSize.zero({ type: 'nologin', error: 'false' });
    this._innsendingApiUploadFileSize.zero({ type: 'nologin', error: 'true' });
    this._innsendingApiUploadFileSize.zero({ type: 'digital', error: 'false' });
    this._innsendingApiUploadFileSize.zero({ type: 'digital', error: 'true' });

    this._innsendingApiUploadDuration = new Histogram({
      name: 'fyllut_innsending_api_upload_duration_seconds',
      help: 'Duration of file uploads to innsending-api in seconds',
      labelNames: ['type', 'error'],
      buckets: [0.25, 0.5, 1.0, 2.0, 4.0, 8.0, 16.0, 32.0, 64.0, 128.0],
      registers: [this._register],
    });
    this._innsendingApiUploadDuration.zero({ type: 'nologin', error: 'false' });
    this._innsendingApiUploadDuration.zero({ type: 'nologin', error: 'true' });
    this._innsendingApiUploadDuration.zero({ type: 'digital', error: 'false' });
    this._innsendingApiUploadDuration.zero({ type: 'digital', error: 'true' });

    this._expressJsonBodyParserDuration = new Histogram({
      name: 'fyllut_express_json_body_parser_seconds',
      help: 'Express json body parser duration',
      labelNames: ['endpoint', 'error'],
      buckets: [0.025, 0.05, 0.1, 0.2, 0.4, 0.8, 1.6, 3.2, 6.4, 12.8],
      registers: [this._register],
    });
    this._expressJsonBodyParserDuration.zero({ endpoint: 'put-utfyltsoknad', error: 'false' });
    this._expressJsonBodyParserDuration.zero({ endpoint: 'put-utfyltsoknad', error: 'true' });

    this._idportenVerifyTokenDuration = new Histogram({
      name: 'fyllut_idporten_verify_token_seconds',
      help: 'Idporten auth duration',
      labelNames: [],
      buckets: [0.025, 0.05, 0.1, 0.2, 0.4, 0.8, 1.6, 3.2, 6.4, 12.8],
      registers: [this._register],
    });

    collectDefaultMetrics({ register: this._register });
  }

  public get register() {
    return this._register;
  }

  public get familiePdfRequestsCounter() {
    return this._familiePdfRequestsCounter;
  }

  public get familiePdfFailuresCounter() {
    return this._familiePdfFailuresCounter;
  }

  public get paperSubmissionsCounter() {
    return this._paperSubmissionsCounter;
  }

  public get nologinCaptchaRequestsCounter() {
    return this._nologinCaptchaRequestsCounter;
  }

  public get nologinCaptchaFailuresCounter() {
    return this._nologinCaptchaFailuresCounter;
  }

  public get outgoingRequestDuration() {
    return this._outgoingRequestDuration;
  }

  public get innsendingApiUploadFileSize() {
    return this._innsendingApiUploadFileSize;
  }

  public get innsendingApiUploadDuration() {
    return this._innsendingApiUploadDuration;
  }

  public get idportenVerifyTokenDuration() {
    return this._idportenVerifyTokenDuration;
  }

  public get expressJsonBodyParserDuration() {
    return this._expressJsonBodyParserDuration;
  }
}

export default AppMetrics;
