type RequestUrl = string;
export type MockResponseBody = any;
export type ApiResponse = { status: number; body?: MockResponseBody };
type MockMethod = 'GET' | 'PUT' | 'POST' | 'DELETE';
type RecordedRequest = { method: MockMethod; url: RequestUrl; body?: any };

const EMPTY_MAP = {
  GET: {},
  PUT: {},
  POST: {},
  DELETE: {},
};
const mockResponses: Record<MockMethod, Record<RequestUrl, ApiResponse>> = EMPTY_MAP;
const calls: { requests: RecordedRequest[] } = {
  requests: [],
};
const mockStore = {
  clear: () => {
    Object.keys(mockResponses).forEach((method) => (mockResponses[method] = {}));
    calls.requests = [];
  },
  mock: (method: MockMethod, url: string, path: string, status: number, body?: MockResponseBody) => {
    const requestUrl = `${url}${path}`;
    mockResponses[method][requestUrl] = { status, body };
  },
  find: (requestUrl: string, method: MockMethod = 'GET') => mockResponses[method][requestUrl],
};

interface MockReply {
  reply: (status: number, body?: MockResponseBody) => void;
}

interface MockMethods {
  get: (path: string) => MockReply;
  put: (path: string) => MockReply;
  post: (path: string) => MockReply;
  delete: (path: string) => MockReply;
}

export interface MswUtils {
  mock: (url: string) => MockMethods;
  clear: () => void;
  find: (url: string, method?: MockMethod) => ApiResponse | undefined;
  debug: () => void;
  record: (request: RecordedRequest) => void;
  calls: () => RecordedRequest[];
}

const mswUtils: MswUtils = {
  mock: (url: string) => ({
    get: (path: string): MockReply => ({
      reply: (status: number, body?: MockResponseBody) => {
        mockStore.mock('GET', url, path, status, body);
      },
    }),
    put: (path: string): MockReply => ({
      reply: (status: number, body?: MockResponseBody) => {
        mockStore.mock('PUT', url, path, status, body);
      },
    }),
    post: (path: string): MockReply => ({
      reply: (status: number, body?: MockResponseBody) => {
        mockStore.mock('POST', url, path, status, body);
      },
    }),
    delete: (path: string): MockReply => ({
      reply: (status: number, body?: MockResponseBody) => {
        mockStore.mock('DELETE', url, path, status, body);
      },
    }),
  }),
  clear: () => {
    mockStore.clear();
  },
  find: (url: string, method?: MockMethod) => mockStore.find(url, method),
  record: (request: RecordedRequest) => calls.requests.push(request),
  calls: () => calls.requests,
  debug: () => {
    console.debug(`mswUtils -> registered mock responses: ${JSON.stringify(mockResponses, undefined, 2)}`);
    console.debug(`mswUtils -> calls: ${JSON.stringify(calls.requests, undefined, 2)}`);
  },
};

export default mswUtils;
