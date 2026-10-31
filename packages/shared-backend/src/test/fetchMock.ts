type QueryMatcher = true | Record<string, string>;

type RecordedRequest = {
  method: string;
  url: URL;
  headers: Headers;
  body: string;
};

type Interceptor = {
  method: string;
  baseUrl: URL;
  path: string | RegExp;
  query?: QueryMatcher;
  headers: Record<string, string>;
  times: number;
  status: number;
  body?: unknown;
  replyHeaders: Record<string, string>;
  requests: RecordedRequest[];
};

const LOCAL_HOSTS = ['127.0.0.1', 'localhost'];

const originalFetch = globalThis.fetch;
let interceptors: Interceptor[] = [];

const isPending = (interceptor: Interceptor) => interceptor.requests.length < interceptor.times;

const describeInterceptor = ({ method, baseUrl, path }: Interceptor) =>
  `${method} ${baseUrl.href.replace(/\/$/, '')}${path}`;

const matchesPathAndQuery = (interceptor: Interceptor, url: URL) => {
  const basePath = interceptor.baseUrl.pathname.replace(/\/$/, '');
  if (url.origin !== interceptor.baseUrl.origin || !url.pathname.startsWith(basePath)) return false;

  const pathname = url.pathname.slice(basePath.length);
  const { path, query } = interceptor;

  if (path instanceof RegExp) return path.test(`${pathname}${url.search}`);
  if (query === undefined) return `${pathname}${url.search}` === path;
  if (pathname !== path) return false;
  if (query === true) return true;

  const expected = new URLSearchParams(query);
  return (
    expected.size === url.searchParams.size &&
    [...expected].every(([key, value]) => url.searchParams.get(key) === value)
  );
};

const matches = (interceptor: Interceptor, request: Request, url: URL) =>
  isPending(interceptor) &&
  interceptor.method === request.method &&
  matchesPathAndQuery(interceptor, url) &&
  Object.entries(interceptor.headers).every(([name, value]) => request.headers.get(name) === value);

const createResponse = ({ status, body, replyHeaders }: Interceptor) => {
  const headers = new Headers(replyHeaders);
  if (body === undefined || body === null) return new Response(null, { status, headers });
  if (typeof body === 'string' || body instanceof Uint8Array)
    return new Response(body as BodyInit, { status, headers });

  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify(body), { status, headers });
};

const mockedFetch: typeof fetch = async (input, init) => {
  const request = new Request(input, init);
  const url = new URL(request.url);

  if (LOCAL_HOSTS.includes(url.hostname)) return originalFetch(input, init);

  const interceptor = interceptors.find((candidate) => matches(candidate, request, url));
  if (!interceptor) {
    throw new Error(`fetchMock: no pending interceptor for ${request.method} ${url.href}`);
  }

  interceptor.requests.push({
    method: request.method,
    url,
    headers: request.headers,
    body: await request.text(),
  });
  return createResponse(interceptor);
};

class InterceptorBuilder {
  private readonly interceptor: Omit<Interceptor, 'status' | 'body'>;

  constructor(
    private readonly scope: FetchMockScope,
    method: string,
    baseUrl: URL,
    path: string | RegExp,
  ) {
    this.interceptor = { method, baseUrl, path, headers: {}, times: 1, replyHeaders: {}, requests: [] };
  }

  query = (query: QueryMatcher) => {
    this.interceptor.query = query;
    return this;
  };

  matchHeader = (name: string, value: string) => {
    this.interceptor.headers[name] = value;
    return this;
  };

  times = (times: number) => {
    this.interceptor.times = times;
    return this;
  };

  reply = (status: number, body?: unknown, headers: Record<string, string> = {}) =>
    this.scope.register({ ...this.interceptor, status, body, replyHeaders: headers });
}

class FetchMockScope {
  private readonly scopeInterceptors: Interceptor[] = [];
  private readonly baseUrl: URL;

  constructor(baseUrl: string) {
    this.baseUrl = new URL(baseUrl);
  }

  get = (path: string | RegExp) => new InterceptorBuilder(this, 'GET', this.baseUrl, path);
  post = (path: string | RegExp) => new InterceptorBuilder(this, 'POST', this.baseUrl, path);
  put = (path: string | RegExp) => new InterceptorBuilder(this, 'PUT', this.baseUrl, path);
  delete = (path: string | RegExp) => new InterceptorBuilder(this, 'DELETE', this.baseUrl, path);

  register = (interceptor: Interceptor) => {
    interceptors.push(interceptor);
    this.scopeInterceptors.push(interceptor);
    return this;
  };

  get requests() {
    return this.scopeInterceptors.flatMap((interceptor) => interceptor.requests);
  }

  isDone = () => !this.scopeInterceptors.some(isPending);

  done = () => {
    const pending = this.scopeInterceptors.filter(isPending);
    if (pending.length > 0) {
      throw new Error(`fetchMock: pending interceptors: ${pending.map(describeInterceptor).join(', ')}`);
    }
  };
}

// Replaces global fetch so tests only reach registered interceptors and local servers.
const installFetchMock = () => {
  globalThis.fetch = mockedFetch;
};

const mockFetch = (baseUrl: string) => new FetchMockScope(baseUrl);

const resetFetchMock = () => {
  interceptors = [];
};

const isFetchMockDone = () => !interceptors.some(isPending);

export { installFetchMock, isFetchMockDone, mockFetch, resetFetchMock };
export type { FetchMockScope, RecordedRequest };
