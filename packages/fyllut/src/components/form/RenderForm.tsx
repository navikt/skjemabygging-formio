import { sendInnSoknadApi, url, useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import {
  attachmentUtils,
  Form,
  formioFormsApiUtils,
  localizationUtils,
  ReceiptSummary,
  Submission,
  SubmissionMethod,
  submissionTypesUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import {
  applyPrefilledValuesToSubmission,
  FormRendererRoute,
  SharedFormRenderer,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import FormLanguageSelector from './FormLanguageSelector';
import useAttachmentAdapter from './host-adapters/useAttachmentAdapter';
import useNoLoginToken from './host-adapters/useNoLoginToken';
import useSubmitters from './useSubmitters';

const DELETED_DRAFT_STORAGE_KEY = 'fyllut:new-render:deleted-draft-id';
const DELETED_DRAFT_QUERY_PARAM = 'deletedDraft';

interface Props {
  form: Form;
  initialSubmission?: Submission;
  initialInnsendingsId?: string;
}

const getMyPageUrl = (urlValue: string) => {
  if (urlValue.includes('.dev.nav.')) {
    return urlValue.includes('ansatt')
      ? 'https://www.ansatt.dev.nav.no/minside'
      : 'https://www.intern.dev.nav.no/minside';
  }
  return 'https://www.nav.no/minside';
};

const getRoute = (form: Form, pathname: string, hash: string, state: unknown): FormRendererRoute => {
  const routeKey = pathname.slice(`/${form.path}`.length).replace(/^\//, '');
  if (routeKey === 'kvittering') {
    const routeState = state as { receipt?: ReceiptSummary; pdfBase64?: string } | null;
    return { kind: 'receipt', receipt: routeState?.receipt, pdfBase64: routeState?.pdfBase64 };
  }
  if (routeKey === 'send-i-posten') {
    return { kind: 'prepare-submission', type: 'cover-page-and-application' };
  }
  if (routeKey === 'ingen-innsending') {
    return { kind: 'prepare-submission', type: 'application' };
  }
  if (routeKey === 'vedlegg') {
    return { kind: 'attachments' };
  }
  if (routeKey === 'oppsummering') {
    return { kind: 'summary' };
  }
  const focusId =
    typeof state === 'object' && state && 'focusId' in state && typeof state.focusId === 'string'
      ? state.focusId
      : hash.slice(1) || undefined;
  return routeKey ? { kind: 'panel', panelKey: routeKey, focusId } : { kind: 'intro' };
};

const RenderForm = ({ form, initialSubmission: initialSubmissionProp, initialInnsendingsId }: Props) => {
  const appConfig = useAppConfig();
  const { currentLanguage, translate } = useLanguages();
  const { pathname, search, hash, state } = useLocation();
  const navigate = useNavigate();
  const noLoginToken = useNoLoginToken();
  const attachmentAdapter = useAttachmentAdapter(form, noLoginToken.getToken, translate);
  const persistence = useSubmitters(form, initialInnsendingsId, noLoginToken);
  const initialPagesWithErrors =
    typeof state === 'object' && state && 'validationErrorPages' in state && Array.isArray(state.validationErrorPages)
      ? state.validationErrorPages
      : undefined;
  const stateSubmission =
    typeof state === 'object' && state && state.preserveInitialSubmission === true && 'initialSubmission' in state
      ? (state.initialSubmission as Submission)
      : undefined;
  const hydratedInitialSubmission = applyPrefilledValuesToSubmission(
    form,
    stateSubmission ?? initialSubmissionProp,
    currentLanguage,
  );
  const defaultSubmissionMethod =
    appConfig.submissionMethod === undefined && pathname !== `/${form.path}` ? 'paper' : undefined;
  const effectiveSubmissionMethod =
    appConfig.submissionMethod ??
    defaultSubmissionMethod ??
    (submissionTypesUtils.isPaperSubmissionOnly(form.properties.submissionTypes)
      ? 'paper'
      : submissionTypesUtils.isDigitalSubmissionOnly(form.properties.submissionTypes)
        ? 'digital'
        : submissionTypesUtils.isDigitalNoLoginSubmissionOnly(form.properties.submissionTypes)
          ? 'digitalnologin'
          : submissionTypesUtils.isPaperNoCoverPageSubmissionOnly(form.properties.submissionTypes) &&
              (form.properties.submissionTypes?.length ?? 0) > 0
            ? 'papernocoverpage'
            : undefined);
  const route = getRoute(form, pathname, hash, state);
  const deletedDraftId = sessionStorage.getItem(DELETED_DRAFT_STORAGE_KEY);
  const currentDraftId = new URLSearchParams(search).get('innsendingsId');
  const isDeletedDraftSummary =
    new URLSearchParams(search).get(DELETED_DRAFT_QUERY_PARAM) === '1' ||
    (!!deletedDraftId && deletedDraftId === currentDraftId);

  useEffect(() => {
    if (isDeletedDraftSummary) {
      sessionStorage.removeItem(DELETED_DRAFT_STORAGE_KEY);
    }
  }, [isDeletedDraftSummary]);

  const onNavigate = useCallback(
    ({
      route: target,
      submission,
      validationErrorPages,
      focusId,
    }: {
      route: FormRendererRoute;
      submission?: Submission;
      validationErrorPages: string[];
      focusId?: string;
    }) => {
      const path =
        target.kind === 'intro'
          ? `/${form.path}`
          : target.kind === 'panel'
            ? `/${form.path}/${target.panelKey}`
            : target.kind === 'attachments'
              ? `/${form.path}/vedlegg`
              : target.kind === 'summary'
                ? `/${form.path}/oppsummering`
                : target.kind === 'receipt'
                  ? `/${form.path}/kvittering`
                  : `/${form.path}/${target.type === 'application' ? 'ingen-innsending' : 'send-i-posten'}`;
      navigate(
        { pathname: path, search, hash: focusId ? `#${focusId}` : undefined },
        {
          state: {
            ...(typeof state === 'object' && state ? state : {}),
            initialSubmission: submission,
            preserveInitialSubmission: true,
            validationErrorPages,
            focusId,
          },
        },
      );
    },
    [form.path, navigate, search, state],
  );

  const selectSubmissionMethod = useCallback(
    (submissionMethod: SubmissionMethod) => {
      const params = new URLSearchParams(search);
      params.set('sub', submissionMethod);
      if (submissionMethod === 'digital') {
        params.set('forceMellomlagring', 'true');
      } else {
        params.delete('forceMellomlagring');
      }
      const nextSearch = `?${params.toString()}`;

      if (submissionMethod === 'digital' && appConfig.config?.isLoggedIn !== true) {
        window.location.assign(`${window.location.origin}/fyllut/${form.path}${nextSearch}`);
      } else if (submissionMethod === 'digitalnologin') {
        navigate({ pathname: `/${form.path}/legitimasjon`, search: nextSearch });
      } else {
        navigate({ pathname: `/${form.path}`, search: nextSearch });
      }
    },
    [appConfig.config?.isLoggedIn, form.path, navigate, search],
  );

  const cancel = useCallback(
    async (submission: Submission | undefined) => {
      if (effectiveSubmissionMethod === 'digital' && currentDraftId) {
        await sendInnSoknadApi.deleteSoknad(appConfig, currentDraftId);
        sessionStorage.setItem(DELETED_DRAFT_STORAGE_KEY, currentDraftId);
        const deletedDraftUrl = new URL(window.location.href);
        deletedDraftUrl.searchParams.set(DELETED_DRAFT_QUERY_PARAM, '1');
        window.history.replaceState(window.history.state, '', deletedDraftUrl.toString());
      } else if (effectiveSubmissionMethod === 'digitalnologin') {
        await attachmentAdapter.deleteAllFiles();
      }
      void submission;
    },
    [appConfig, attachmentAdapter, currentDraftId, effectiveSubmissionMethod],
  );

  const host = useMemo(
    () => ({
      navigation: { navigate: onNavigate },
      attachments: attachmentAdapter,
      noLogin: {
        getToken: noLoginToken.getToken,
        clearToken: noLoginToken.clearToken,
        tokenExpiration: noLoginToken.tokenExpiration,
      },
      secondaryActions: {
        exitUrl: url.getExitUrl(window.location.href),
        cancel,
        showIdentificationAction: effectiveSubmissionMethod === 'digitalnologin',
        onIdentification: () => navigate({ pathname: `/${form.path}/legitimasjon`, search }),
      },
      pdf: {
        createPdf: async ({
          submission,
          language,
          submissionMethod,
          type,
        }: {
          submission: Submission;
          language: string;
          submissionMethod?: SubmissionMethod;
          type: 'application' | 'cover-page-and-application';
        }) =>
          await appConfig.http?.post<Blob>(
            `${appConfig.fyllutBaseURL}/api/documents${type === 'application' ? '/application' : '/cover-page-and-application'}`,
            {
              language: localizationUtils.getLanguageCodeAsIso639_1(language),
              formPath: form.path,
              submission: JSON.stringify(submission),
              submissionMethod,
            },
            { Accept: appConfig.http?.MimeType.PDF },
          ),
        onDownloaded: ({ type }: { type: 'application' | 'cover-page-and-application' }) =>
          appConfig.logEvent?.({
            name: 'last ned',
            data: {
              type: 'soknad',
              tema: form.properties.tema,
              tittel: translate(form.title),
              skjemaId: form.properties.skjemanummer,
              withCoverPage: type === 'cover-page-and-application',
              submissionMethod: effectiveSubmissionMethod,
              language: currentLanguage,
            },
          }),
        getCoverPageAttachments: (formDefinition: Form, submission: Submission) =>
          attachmentUtils.getAttachmentsForCoverPage(submission, formioFormsApiUtils.mapFormToNavForm(formDefinition)),
        getAttachmentFormUrl: (attachmentFormPath: string) =>
          `${appConfig.fyllutBaseURL}/${attachmentFormPath}?sub=papernocoverpage`,
      },
      receipt: {
        myPageUrl: getMyPageUrl(window.location.href),
        onPdfDownloaded: () =>
          appConfig.logEvent?.({
            name: 'last ned',
            data: {
              type: 'soknad',
              tema: form.properties.tema,
              tittel: translate(form.title),
              skjemaId: form.skjemanummer,
              submissionMethod: effectiveSubmissionMethod,
              language: currentLanguage,
            },
          }),
      },
      languageSelector: <FormLanguageSelector />,
      isLoggedIn: appConfig.config?.isLoggedIn === true,
      isDeletedDraftSummary,
      onSelectSubmissionMethod: selectSubmissionMethod,
    }),
    [
      appConfig,
      attachmentAdapter,
      cancel,
      currentLanguage,
      effectiveSubmissionMethod,
      form,
      noLoginToken.clearToken,
      noLoginToken.getToken,
      noLoginToken.tokenExpiration,
      onNavigate,
      isDeletedDraftSummary,
      navigate,
      selectSubmissionMethod,
      search,
      translate,
    ],
  );

  return (
    <SharedFormRenderer
      form={form}
      initialSubmission={hydratedInitialSubmission}
      initialPagesWithErrors={initialPagesWithErrors}
      language={{ translate, currentLanguage }}
      appConfig={{ submissionMethod: effectiveSubmissionMethod, logger: appConfig.logger, config: appConfig.config }}
      persistence={persistence}
      route={route}
      host={host}
      mode={
        effectiveSubmissionMethod === undefined && (form.properties.submissionTypes?.length ?? 0) > 0
          ? 'submission-method-selection'
          : 'wizard'
      }
    />
  );
};

export default RenderForm;
