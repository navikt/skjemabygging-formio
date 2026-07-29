import {
  FORM_RENDERER_ROUTE_KEY,
  getFormRendererRoute,
  getFormRendererRoutePath,
  getInitialPagesWithErrors,
  getPreservedInitialSubmission,
} from './formRendererRoutes';

describe('formRendererRoutes', () => {
  const formPath = 'example-form';

  it('maps supported paths to renderer routes', () => {
    expect(getFormRendererRoute(formPath, `/${formPath}`, '', null)).toEqual({ kind: 'intro' });
    expect(getFormRendererRoute(formPath, `/${formPath}/${FORM_RENDERER_ROUTE_KEY.attachments}`, '', null)).toEqual({
      kind: 'attachments',
    });
    expect(getFormRendererRoute(formPath, `/${formPath}/${FORM_RENDERER_ROUTE_KEY.summary}`, '', null)).toEqual({
      kind: 'summary',
    });
    expect(
      getFormRendererRoute(formPath, `/${formPath}/${FORM_RENDERER_ROUTE_KEY.prepareApplication}`, '', null),
    ).toEqual({ kind: 'prepare-submission', type: 'application' });
  });

  it('uses location state focus before the URL hash for panel routes', () => {
    expect(getFormRendererRoute(formPath, `/${formPath}/panel`, '#from-hash', { focusId: 'from-state' })).toEqual({
      kind: 'panel',
      panelKey: 'panel',
      focusId: 'from-state',
    });
  });

  it('round-trips renderer routes to form paths', () => {
    expect(getFormRendererRoutePath(formPath, { kind: 'receipt' })).toBe(
      `/${formPath}/${FORM_RENDERER_ROUTE_KEY.receipt}`,
    );
    expect(
      getFormRendererRoutePath(formPath, {
        kind: 'prepare-submission',
        type: 'cover-page-and-application',
      }),
    ).toBe(`/${formPath}/${FORM_RENDERER_ROUTE_KEY.prepareCoverPageAndApplication}`);
  });

  it('reads only valid renderer state values', () => {
    expect(getInitialPagesWithErrors({ validationErrorPages: ['page-one'] })).toEqual(['page-one']);
    expect(getInitialPagesWithErrors({ validationErrorPages: ['page-one', 1] })).toBeUndefined();
    expect(getPreservedInitialSubmission({ initialSubmission: {}, preserveInitialSubmission: false })).toBeUndefined();
  });
});
