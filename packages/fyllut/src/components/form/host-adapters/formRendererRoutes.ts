import type { ReceiptSummary, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import type { FormRendererRoute } from '@navikt/skjemadigitalisering-shared-frontend';

const FORM_RENDERER_ROUTE_KEY = {
  receipt: 'kvittering',
  prepareCoverPageAndApplication: 'send-i-posten',
  prepareApplication: 'ingen-innsending',
  attachments: 'vedlegg',
  summary: 'oppsummering',
} as const;

type RendererLocationState = Record<string, unknown>;

const isLocationState = (state: unknown): state is RendererLocationState => typeof state === 'object' && state !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const getRouteKey = (formPath: string, pathname: string) => pathname.slice(`/${formPath}`.length).replace(/^\//u, '');

const getReceiptRoute = (state: unknown): Extract<FormRendererRoute, { kind: 'receipt' }> => {
  if (!isLocationState(state)) {
    return { kind: 'receipt' };
  }

  return {
    kind: 'receipt',
    receipt: state.receipt as ReceiptSummary | undefined,
    pdfBase64: typeof state.pdfBase64 === 'string' ? state.pdfBase64 : undefined,
  };
};

const getFocusId = (state: unknown, hash: string) => {
  if (isLocationState(state) && typeof state.focusId === 'string') {
    return state.focusId;
  }
  return hash.slice(1) || undefined;
};

const getFormRendererRoute = (formPath: string, pathname: string, hash: string, state: unknown): FormRendererRoute => {
  const routeKey = getRouteKey(formPath, pathname);

  if (routeKey === FORM_RENDERER_ROUTE_KEY.receipt) {
    return getReceiptRoute(state);
  }
  if (routeKey === FORM_RENDERER_ROUTE_KEY.prepareCoverPageAndApplication) {
    return { kind: 'prepare-submission', type: 'cover-page-and-application' };
  }
  if (routeKey === FORM_RENDERER_ROUTE_KEY.prepareApplication) {
    return { kind: 'prepare-submission', type: 'application' };
  }
  if (routeKey === FORM_RENDERER_ROUTE_KEY.attachments) {
    return { kind: 'attachments' };
  }
  if (routeKey === FORM_RENDERER_ROUTE_KEY.summary) {
    return { kind: 'summary' };
  }
  if (routeKey) {
    return { kind: 'panel', panelKey: routeKey, focusId: getFocusId(state, hash) };
  }
  return { kind: 'intro' };
};

const getFormRendererRoutePath = (formPath: string, route: FormRendererRoute) => {
  const basePath = `/${formPath}`;

  switch (route.kind) {
    case 'intro':
      return basePath;
    case 'panel':
      return `${basePath}/${route.panelKey}`;
    case 'attachments':
      return `${basePath}/${FORM_RENDERER_ROUTE_KEY.attachments}`;
    case 'summary':
      return `${basePath}/${FORM_RENDERER_ROUTE_KEY.summary}`;
    case 'receipt':
      return `${basePath}/${FORM_RENDERER_ROUTE_KEY.receipt}`;
    case 'prepare-submission':
      return route.type === 'application'
        ? `${basePath}/${FORM_RENDERER_ROUTE_KEY.prepareApplication}`
        : `${basePath}/${FORM_RENDERER_ROUTE_KEY.prepareCoverPageAndApplication}`;
  }
};

const getInitialPagesWithErrors = (state: unknown) =>
  isLocationState(state) && isStringArray(state.validationErrorPages) ? state.validationErrorPages : undefined;

const getPreservedInitialSubmission = (state: unknown): Submission | undefined => {
  if (!isLocationState(state) || state.preserveInitialSubmission !== true || !('initialSubmission' in state)) {
    return undefined;
  }
  return state.initialSubmission as Submission;
};

const getNavigationState = (state: unknown): RendererLocationState => (isLocationState(state) ? state : {});

export {
  FORM_RENDERER_ROUTE_KEY,
  getFormRendererRoute,
  getFormRendererRoutePath,
  getInitialPagesWithErrors,
  getNavigationState,
  getPreservedInitialSubmission,
};
