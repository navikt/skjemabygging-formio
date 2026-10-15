import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

type MockRequest = IncomingMessage & { body: unknown; path: string; params: Record<string, string> };
type MockResponse = ServerResponse & {
  status: (code: number) => MockResponse;
  set: (headers: Record<string, string>) => MockResponse;
  send: (body: unknown) => void;
};
type Middleware = (req: MockRequest, res: MockResponse, next: (error?: unknown) => void) => unknown;
type Epoch = { epochId: string; testId: string; attempt: number };
type Observation = Epoch & {
  requestId: string;
  routeId: string;
  variantId: string;
  status: number | null;
  response: 'pending' | 'completed' | 'aborted';
  validation: 'not-run' | 'passed' | 'failed';
  mismatchPaths: string[];
};
type Route = { id: string; variants: { id: string; type: string; options: Record<string, unknown> }[] };
const routeIds = new Set(['post-familie-pdf', 'post-digital-soknad']);

const parseEpoch = (value: string): Epoch => {
  const epoch: unknown = JSON.parse(value);
  if (
    !epoch ||
    typeof epoch !== 'object' ||
    !('epochId' in epoch) ||
    typeof epoch.epochId !== 'string' ||
    !('testId' in epoch) ||
    typeof epoch.testId !== 'string' ||
    !('attempt' in epoch) ||
    epoch.attempt !== 0
  )
    throw new Error('INVALID_PLAYWRIGHT_EPOCH');
  return Object.freeze({ epochId: epoch.epochId, testId: epoch.testId, attempt: epoch.attempt });
};

const createEvidence = (identity: Epoch) => {
  const epoch = Object.freeze({ ...identity });
  const requests = new WeakMap<object, Observation>();
  const records: Observation[] = [];
  let owner: string | undefined;
  let released = false;
  let snapshotted = false;
  let expected: Record<string, string> = {};
  let arrived: () => void;
  const pdfArrival = new Promise<void>((resolve) => {
    arrived = resolve;
  });
  const control: Middleware = (req, res) => {
    const epochHeader = req.headers['x-playwright-epoch'];
    const ownerHeader = req.headers['x-playwright-owner'];
    const reply = (status: number, code: string) => res.status(status).send({ code });
    if (epochHeader !== epoch.epochId || typeof ownerHeader !== 'string' || !ownerHeader) {
      return reply(409, 'EVIDENCE_OWNER_MISMATCH');
    }
    if (req.method === 'POST' && req.path === '/claim') {
      if (owner || released) return reply(409, 'EVIDENCE_ALREADY_OWNED');
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))
        return reply(400, 'INVALID_EXPECTATIONS');
      const entries = Object.entries(req.body);
      if (!entries.length) return reply(400, 'INVALID_EXPECTATIONS');
      const registered: Record<string, string> = {};
      for (const [route, variant] of entries) {
        if (!routeIds.has(route) || variant !== 'success-tc07') return reply(400, 'INVALID_EXPECTATIONS');
        registered[route] = variant;
      }
      expected = registered;
      owner = ownerHeader;
      return res.status(201).send({ ...epoch });
    }
    if (ownerHeader !== owner || released) return reply(409, 'EVIDENCE_OWNER_MISMATCH');
    if (
      req.method === 'GET' &&
      req.path === '/wait-for-pdf' &&
      process.env.FYLLUT_PLAYWRIGHT_TEST_FAULT === 'hold-pdf'
    ) {
      return pdfArrival.then(() => res.status(200).send({ code: 'PDF_REQUEST_HELD' }));
    }
    if (req.method === 'GET' && req.path === '/snapshot') {
      snapshotted = true;
      return res.status(200).send(structuredClone({ ...epoch, expected, records }));
    }
    if (req.method === 'POST' && req.path === '/release') {
      if (!snapshotted) return reply(409, 'EVIDENCE_SNAPSHOT_REQUIRED');
      released = true;
      return res.status(204).send(undefined);
    }
    return reply(404, 'EVIDENCE_CONTROL_NOT_FOUND');
  };
  const begin = (req: MockRequest, res: MockResponse, routeId: string, variantId: string) => {
    const record: Observation = {
      ...epoch,
      requestId: randomUUID(),
      routeId,
      variantId,
      status: null,
      response: 'pending',
      validation: 'not-run',
      mismatchPaths: [],
    };
    records.push(record);
    if (routeId === 'post-familie-pdf') arrived();
    requests.set(req, record);
    snapshotted = false;
    res.once('finish', () => {
      record.status = res.statusCode;
      record.response = 'completed';
    });
    res.once('close', () => {
      if (record.response === 'pending') {
        record.status = res.statusCode;
        record.response = 'aborted';
      }
    });
  };
  const reportValidation = (request: object, mismatchPaths: string[]) => {
    const record = requests.get(request);
    if (!record) return;
    record.validation = mismatchPaths.length ? 'failed' : 'passed';
    record.mismatchPaths = [...mismatchPaths];
  };
  return { control, begin, reportValidation };
};

const evidenceKey = Symbol.for('fyllut.playwright.immutable-epoch');
const processState = globalThis as typeof globalThis & {
  [evidenceKey]?: { identity: string; evidence: ReturnType<typeof createEvidence> };
};
const loadEvidence = () => {
  const identity = process.env.FYLLUT_PLAYWRIGHT_EPOCH;
  if (!identity) return undefined;
  // Mocks Server reloads route modules and clears require caches. The epoch must not reset.
  if (processState[evidenceKey] && processState[evidenceKey].identity !== identity) {
    throw new Error('EVIDENCE_EPOCH_REASSIGNMENT');
  }
  processState[evidenceKey] ??= { identity, evidence: createEvidence(parseEpoch(identity)) };
  return processState[evidenceKey].evidence;
};
const activeEvidence = loadEvidence();

const reportValidation = (request: object, mismatchPaths: string[]) => {
  activeEvidence?.reportValidation(request, mismatchPaths);
};

const observeRoute = <T extends Route>(route: T): T | Route => {
  if (!activeEvidence || !routeIds.has(route.id)) return route;
  return {
    ...route,
    variants: route.variants.map((variant) => {
      if (!['json', 'middleware', 'text'].includes(variant.type)) {
        throw new Error(`UNSUPPORTED_OBSERVED_VARIANT: ${route.id}:${variant.id}:${variant.type}`);
      }
      const middleware: Middleware = async (req, res, next) => {
        activeEvidence.begin(req, res, route.id, variant.id);
        try {
          if (process.env.FYLLUT_PLAYWRIGHT_TEST_FAULT === 'hold-pdf' && route.id === 'post-familie-pdf') {
            await new Promise<void>((done) => res.once('close', done));
            return;
          }
          if (variant.type === 'middleware') {
            const handler = variant.options.middleware;
            if (typeof handler !== 'function') throw new Error('UNSUPPORTED_OBSERVED_MIDDLEWARE');
            await handler(req, res, next);
          } else {
            const status = variant.options.status;
            if (typeof status !== 'number') throw new Error('INVALID_OBSERVED_STATUS');
            const headers = variant.options.headers ?? {};
            if (
              typeof headers !== 'object' ||
              headers === null ||
              Object.values(headers).some((value) => typeof value !== 'string')
            ) {
              throw new Error('INVALID_OBSERVED_HEADERS');
            }
            res.set({
              'Content-Type': variant.type === 'json' ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
              ...headers,
            });
            res.status(status).send(variant.options.body);
          }
        } catch (error) {
          next(error);
        }
      };
      return { ...variant, type: 'middleware', options: { middleware } };
    }),
  };
};

export { activeEvidence, createEvidence, observeRoute, reportValidation, type Middleware };
