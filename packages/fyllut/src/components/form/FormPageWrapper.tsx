import { FyllUtRouter, LanguagesProvider, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import {
  Component,
  dateUtils,
  Form,
  formioFormsApiUtils,
  FormsApiTranslationMap,
  formSummaryUtils,
  hasErrorCode,
  I18nTranslations,
  localizationUtils,
  navFormUtils,
  Submission,
  SubmissionData,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import {
  applyPrefilledValuesToSubmission,
  buildDigitalFormSearch,
  resolveDefaultSubmissionMethod,
  shouldUseLegacyPageForNewRenderer,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import createApplicationService from '../../adapter-services/createApplicationService';
import useFormsApiForms from '../../api/useFormsApiForms';
import { loadAllTranslations, loadNewRendererTranslations } from '../../api/useTranslations';
import { NotFoundPage } from '../errors/NotFoundPage';
import SubmissionMethodNotAllowed from '../SubmissionMethodNotAllowed';
import FormPageSkeleton from './FormPageSkeleton';
import RenderFormAdapter from './RenderFormAdapter';

const collectPrefillKeys = (components: Component[] = []): string[] =>
  components.flatMap((component) => [
    ...(Array.isArray(component.prefillKey)
      ? component.prefillKey
      : typeof component.prefillKey === 'string'
        ? [component.prefillKey]
        : []),
    ...(component.components ? collectPrefillKeys(component.components) : []),
  ]);

const toComponentPrefillValue = (value: unknown): string | object | undefined =>
  typeof value === 'string' || (typeof value === 'object' && value !== null) ? value : undefined;

const buildSearchWithSubmissionMethod = (search: string, submissionMethod: string) => {
  const searchParams = new URLSearchParams(search);
  searchParams.set('sub', submissionMethod);
  return `?${searchParams.toString()}`;
};

const getDraftBootstrapLanguage = (search: string): TranslationLang => {
  const language = new URLSearchParams(search).get('lang');
  return language ? localizationUtils.getLanguageCodeAsIso639_1(language) : 'nb';
};

const withDraftMetadata = (
  submission: Submission | undefined,
  draft?: { modifiedAt: string; deleteAt: string },
): Submission | undefined => {
  if (!submission || !draft) {
    return submission;
  }

  return {
    ...submission,
    fyllutState: {
      ...submission.fyllutState,
      mellomlagring: {
        ...submission.fyllutState?.mellomlagring,
        isActive: true,
        savedDate: dateUtils.toLocaleDateAndTime(draft.modifiedAt),
        deletionDate: dateUtils.toLocaleDate(draft.deleteAt),
      },
    },
  };
};

const enrichComponentsWithPrefillValues = (components: Component[] = [], prefillData?: SubmissionData): Component[] =>
  components.map((component) => {
    const prefillValue = Array.isArray(component.prefillKey)
      ? component.prefillKey.reduce<Record<string, unknown>>((acc, key) => {
          if (prefillData?.[key] !== undefined) {
            acc[key] = prefillData[key];
          }
          return acc;
        }, {})
      : typeof component.prefillKey === 'string'
        ? toComponentPrefillValue(prefillData?.[component.prefillKey])
        : undefined;

    return {
      ...component,
      ...(component.components
        ? { components: enrichComponentsWithPrefillValues(component.components, prefillData) }
        : {}),
      ...(component.protectedApiKey && prefillValue !== undefined ? { readOnly: true } : {}),
      ...((
        Array.isArray(component.prefillKey)
          ? typeof prefillValue === 'object' && prefillValue !== null && Object.keys(prefillValue).length > 0
          : prefillValue !== undefined
      )
        ? { prefillValue }
        : {}),
    };
  });

const FormPageWrapper = () => {
  const { formPath, '*': routePath } = useParams();
  const { search, state } = useLocation();
  const navigate = useNavigate();
  const [legacyTranslations, setLegacyTranslations] = useState<I18nTranslations>();
  const [newRendererTranslations, setNewRendererTranslations] = useState<FormsApiTranslationMap>();
  const [loading, setLoading] = useState<boolean>(true);
  const [form, setForm] = useState<Form>();
  const [initialSubmission, setInitialSubmission] = useState<Submission | undefined>();
  const [initialInnsendingsId, setInitialInnsendingsId] = useState<string | undefined>();
  const [initialLanguage, setInitialLanguage] = useState<TranslationLang | undefined>();
  const [loadedDataKey, setLoadedDataKey] = useState<string | undefined>();
  const loadingDataKeyRef = useRef<string>();
  const { get } = useFormsApiForms();
  const appConfig = useAppConfig();
  const { submissionMethod, config, http, baseUrl } = appConfig;
  const applicationService = useMemo(
    () => (http ? createApplicationService({ http, backendBaseUrl: baseUrl ?? '/fyllut' }) : undefined),
    [baseUrl, http],
  );
  const useNewRenderer =
    !!formPath && ((config?.newRenderForms ?? []).includes('*') || (config?.newRenderForms ?? []).includes(formPath));
  const useLegacyPageForNewRenderer = shouldUseLegacyPageForNewRenderer(routePath);
  const shouldUseNewRenderer = useNewRenderer && !useLegacyPageForNewRenderer;
  const navForm = useMemo(() => (form ? formioFormsApiUtils.mapFormToNavForm(form) : undefined), [form]);
  const defaultRouteSubmissionMethod = useMemo(
    () => (form ? resolveDefaultSubmissionMethod(form.properties.submissionTypes) : undefined),
    [form],
  );
  const dataKey = `${formPath ?? ''}|${submissionMethod ?? ''}|${shouldUseNewRenderer ? 'new' : 'legacy'}`;
  const noLoginInitialSubmission =
    submissionMethod === 'digitalnologin' && typeof state === 'object' && state && 'initialSubmission' in state
      ? (state.initialSubmission as Submission | undefined)
      : undefined;
  const missingSubmissionMethodOnDirectRoute =
    useNewRenderer &&
    !useLegacyPageForNewRenderer &&
    !!routePath &&
    !new URLSearchParams(search).has('sub') &&
    defaultRouteSubmissionMethod === 'paper';

  useEffect(() => {
    if (!missingSubmissionMethodOnDirectRoute || !defaultRouteSubmissionMethod) {
      return;
    }

    navigate(
      {
        search: buildSearchWithSubmissionMethod(search, defaultRouteSubmissionMethod),
      },
      { replace: true },
    );
  }, [defaultRouteSubmissionMethod, missingSubmissionMethodOnDirectRoute, navigate, search]);

  const loadTranslations = useCallback(async () => {
    if (!formPath) {
      return;
    }

    if (shouldUseNewRenderer) {
      setNewRendererTranslations(await loadNewRendererTranslations(formPath));
      return;
    }

    const translationsData = await loadAllTranslations(formPath);
    if (translationsData) {
      setLegacyTranslations(translationsData);
    }
  }, [formPath, shouldUseNewRenderer]);

  const loadForm = useCallback(async () => {
    if (!formPath) {
      return;
    }

    const formData = await get(
      formPath,
      'title,skjemanummer,path,revision,introPage,components,properties,publishedLanguages,firstPanelSlug',
    );
    if (formData) {
      const prefillKeys =
        submissionMethod === 'digital' ? Array.from(new Set(collectPrefillKeys(formData.components))) : [];
      const prefillData =
        submissionMethod === 'digital' && prefillKeys.length > 0
          ? await http?.get<SubmissionData>(`${baseUrl}/api/send-inn/prefill-data?properties=${prefillKeys.join(',')}`)
          : undefined;
      const nextForm = {
        ...formData,
        components: enrichComponentsWithPrefillValues(formData.components, prefillData),
      };
      setForm(nextForm);
      return nextForm;
    }
  }, [baseUrl, formPath, get, http, submissionMethod]);

  const loadInitialSubmission = useCallback(
    async (loadedForm?: Form): Promise<{ navigated: boolean }> => {
      const searchParams = new URLSearchParams(search);
      const innsendingsId = searchParams.get('innsendingsId') ?? undefined;
      if (submissionMethod !== 'digital') {
        setInitialInnsendingsId(undefined);
        setInitialLanguage(undefined);
        setInitialSubmission(undefined);
        return { navigated: false };
      }

      if (!loadedForm) {
        setInitialInnsendingsId(undefined);
        setInitialLanguage(undefined);
        setInitialSubmission(undefined);
        return { navigated: false };
      }

      if (!shouldUseNewRenderer) {
        setInitialInnsendingsId(undefined);
        setInitialLanguage(undefined);
        setInitialSubmission(undefined);
        return { navigated: false };
      }

      if (!applicationService) {
        throw new Error('Application service is required to load a new-render draft.');
      }

      if (innsendingsId) {
        let draft;
        try {
          draft = await applicationService.getDraft(innsendingsId);
        } catch (error) {
          if (hasErrorCode(error, 'NOT_FOUND')) {
            navigate('/soknad-ikke-funnet', { replace: true });
            return { navigated: true };
          }

          throw error;
        }
        setInitialInnsendingsId(innsendingsId);
        setInitialLanguage(draft.language);
        setInitialSubmission(
          withDraftMetadata(formSummaryUtils.filterSubmissionDataToSummary(loadedForm, draft.submission), draft),
        );
        return { navigated: false };
      }

      const currentLanguage = getDraftBootstrapLanguage(search);
      const bootstrapSubmission = applyPrefilledValuesToSubmission(loadedForm, undefined, currentLanguage) ?? {
        data: {},
      };
      const result = await applicationService.createDraft({
        formPath: loadedForm.path,
        submission: bootstrapSubmission,
        language: currentLanguage,
        submissionMethod,
        force: searchParams.get('forceMellomlagring') === 'true',
      });

      if (result.status === 'alreadyExists') {
        navigate(
          {
            pathname: `/${loadedForm.path}/paabegynt`,
            search: buildDigitalFormSearch(search, { forceMellomlagring: undefined }),
          },
          { replace: true },
        );
        return { navigated: true };
      }

      if (result.status === 'created') {
        const bootstrappedSubmission = withDraftMetadata(result.draft.submission ?? bootstrapSubmission, result.draft);
        setInitialInnsendingsId(result.draft.id);
        setInitialLanguage(result.draft.language);
        setInitialSubmission(bootstrappedSubmission);
        navigate(
          {
            search: buildDigitalFormSearch(search, {
              forceMellomlagring: undefined,
              innsendingsId: result.draft.id,
            }),
          },
          { replace: true },
        );
        return { navigated: true };
      }

      setInitialInnsendingsId(undefined);
      setInitialLanguage(undefined);
      setInitialSubmission(undefined);
      return { navigated: false };
    },
    [applicationService, navigate, search, shouldUseNewRenderer, submissionMethod],
  );

  useEffect(() => {
    if (missingSubmissionMethodOnDirectRoute || loadedDataKey === dataKey || loadingDataKeyRef.current === dataKey) {
      return;
    }
    loadingDataKeyRef.current = dataKey;

    (async () => {
      let navigated = false;
      try {
        setLoading(true);
        setLoadedDataKey(undefined);
        setInitialSubmission(undefined);
        setInitialInnsendingsId(undefined);
        setInitialLanguage(undefined);
        const loadedForm = await loadForm();
        const [, initialSubmissionResult] = await Promise.all([loadTranslations(), loadInitialSubmission(loadedForm)]);
        navigated = initialSubmissionResult.navigated;
      } catch (_e) {
        setLegacyTranslations(undefined);
        setNewRendererTranslations(undefined);
        setForm(undefined);
      } finally {
        if (loadingDataKeyRef.current === dataKey) {
          loadingDataKeyRef.current = undefined;
        }
        if (!navigated) {
          setLoadedDataKey(dataKey);
          setLoading(false);
        }
      }
    })();
  }, [dataKey, loadForm, loadInitialSubmission, loadTranslations, loadedDataKey, missingSubmissionMethodOnDirectRoute]);

  useEffect(() => {
    const metaPropOgTitle = document.querySelector('meta[property="og:title"]');
    const metaNameDescr = document.querySelector('meta[name="description"]');
    const metaNameOgDescr = document.querySelector('meta[property="og:description"]');
    const setHeaderProp = function (headerObj, metaPropValue) {
      headerObj?.setAttribute('content', metaPropValue);
    };

    if (form) {
      if (form.title) {
        document.title = `${form.title} | www.nav.no`;
        setHeaderProp(metaPropOgTitle, `${form.title} | www.nav.no`);
      }
    }

    return function cleanup() {
      document.title = 'Fyll ut skjema - www.nav.no';
      setHeaderProp(metaPropOgTitle, 'Fyll ut skjema - www.nav.no');
      setHeaderProp(metaNameDescr, 'Nav søknadsskjema');
      setHeaderProp(metaNameOgDescr, 'Nav søknadsskjema');
    };
  }, [form]);

  if (loading || loadedDataKey !== dataKey) {
    return <FormPageSkeleton />;
  }

  if (!form || !navForm) {
    return <NotFoundPage />;
  }

  if (submissionMethod && !navFormUtils.isSubmissionMethodAllowed(submissionMethod, navForm)) {
    return <SubmissionMethodNotAllowed submissionMethod={submissionMethod} />;
  }

  if (shouldUseNewRenderer) {
    if (!newRendererTranslations) {
      return <NotFoundPage />;
    }

    return (
      <RenderFormAdapter
        form={form}
        translations={newRendererTranslations}
        initialSubmission={initialSubmission ?? noLoginInitialSubmission}
        initialInnsendingsId={initialInnsendingsId}
        initialLanguage={initialLanguage}
      />
    );
  }

  if (!legacyTranslations) {
    return <NotFoundPage />;
  }

  return (
    <LanguagesProvider translations={legacyTranslations}>
      <FyllUtRouter form={navForm} />
    </LanguagesProvider>
  );
};

export default FormPageWrapper;
