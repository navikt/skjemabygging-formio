import {
  FyllUtRouter,
  LanguagesProvider,
  sendInnSoknadApi,
  useAppConfig,
} from '@navikt/skjemadigitalisering-shared-components';
import {
  Component,
  Form,
  formioFormsApiUtils,
  I18nTranslations,
  navFormUtils,
  Submission,
  SubmissionData,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import useFormsApiForms from '../../api/useFormsApiForms';
import { loadAllTranslations } from '../../api/useTranslations';
import { NotFoundPage } from '../errors/NotFoundPage';
import SubmissionMethodNotAllowed from '../SubmissionMethodNotAllowed';
import { shouldUseLegacyPageForNewRenderer } from './digitalDraftUtils';
import FormPageSkeleton from './FormPageSkeleton';
import RenderForm from './RenderForm';

const DELETED_DRAFT_STORAGE_KEY = 'fyllut:new-render:deleted-draft-id';
const DELETED_DRAFT_QUERY_PARAM = 'deletedDraft';
const DEFAULT_SUBMISSION_METHOD = 'paper';

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
  const [translations, setTranslations] = useState<I18nTranslations>();
  const [loading, setLoading] = useState<boolean>(true);
  const [form, setForm] = useState<Form>();
  const [initialSubmission, setInitialSubmission] = useState<Submission | undefined>();
  const [initialInnsendingsId, setInitialInnsendingsId] = useState<string | undefined>();
  const [loadedLocationKey, setLoadedLocationKey] = useState<string | undefined>();
  const deletedDraftIdRef = useRef<string | undefined>(undefined);
  const { get } = useFormsApiForms();
  const appConfig = useAppConfig();
  const { submissionMethod, config, http, baseUrl, attachmentPageEnabled, setAttachmentPageEnabled } = appConfig;
  const useNewRenderer =
    !!formPath && ((config?.newRenderForms ?? []).includes('*') || (config?.newRenderForms ?? []).includes(formPath));
  const useLegacyPageForNewRenderer = shouldUseLegacyPageForNewRenderer(routePath);
  const navForm = useMemo(() => (form ? formioFormsApiUtils.mapFormToNavForm(form) : undefined), [form]);
  const locationKey = `${formPath ?? ''}|${routePath ?? ''}|${search}`;
  const missingSubmissionMethodOnDirectRoute =
    useNewRenderer && !useLegacyPageForNewRenderer && !!routePath && !new URLSearchParams(search).has('sub');

  useEffect(() => {
    if (!missingSubmissionMethodOnDirectRoute) {
      return;
    }

    navigate(
      {
        search: buildSearchWithSubmissionMethod(search, DEFAULT_SUBMISSION_METHOD),
      },
      { replace: true },
    );
  }, [missingSubmissionMethodOnDirectRoute, navigate, search]);

  const loadTranslations = useCallback(async () => {
    if (!formPath) {
      return;
    }

    const translationsData = await loadAllTranslations(formPath);
    if (translationsData) {
      setTranslations(translationsData);
    }
  }, [formPath]);

  const loadForm = useCallback(async () => {
    if (!formPath) {
      return;
    }

    const formData = await get(
      formPath,
      'title,skjemanummer,path,revision,introPage,components,properties,firstPanelSlug',
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

  const loadInitialSubmission = useCallback(async () => {
    const searchParams = new URLSearchParams(search);
    const innsendingsId = searchParams.get('innsendingsId') ?? undefined;
    const hasDeletedDraftFlag = searchParams.get(DELETED_DRAFT_QUERY_PARAM) === '1';
    const stateInitialSubmission =
      typeof state === 'object' && state && state.preserveInitialSubmission === true && 'initialSubmission' in state
        ? state.initialSubmission
        : undefined;

    if (submissionMethod !== 'digital' || !innsendingsId) {
      setInitialInnsendingsId(undefined);
      setInitialSubmission(undefined);
      return;
    }

    if (hasDeletedDraftFlag) {
      deletedDraftIdRef.current = innsendingsId;
      setInitialInnsendingsId(undefined);
      setInitialSubmission(undefined);
      return;
    }

    if (sessionStorage.getItem(DELETED_DRAFT_STORAGE_KEY) === innsendingsId) {
      deletedDraftIdRef.current = innsendingsId;
      setInitialInnsendingsId(undefined);
      setInitialSubmission(undefined);
      return;
    }

    if (deletedDraftIdRef.current === innsendingsId) {
      setInitialInnsendingsId(undefined);
      setInitialSubmission(undefined);
      return;
    }

    if (stateInitialSubmission) {
      setInitialInnsendingsId(innsendingsId);
      setInitialSubmission(stateInitialSubmission as Submission);
      return;
    }

    const response = await sendInnSoknadApi.getSoknad(innsendingsId, appConfig);
    setInitialInnsendingsId(innsendingsId);
    setInitialSubmission(response?.hoveddokumentVariant?.document?.data);
  }, [appConfig, search, state, submissionMethod]);

  useEffect(() => {
    if (attachmentPageEnabled === false) {
      setAttachmentPageEnabled?.(true);
    }
  }, [attachmentPageEnabled, setAttachmentPageEnabled]);

  useEffect(() => {
    if (missingSubmissionMethodOnDirectRoute) {
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setLoadedLocationKey(undefined);
        setInitialSubmission(undefined);
        setInitialInnsendingsId(undefined);
        await loadForm();
        await Promise.all([loadTranslations(), loadInitialSubmission()]);
      } catch (_e) {
        setTranslations(undefined);
        setForm(undefined);
      } finally {
        setLoadedLocationKey(locationKey);
        setLoading(false);
      }
    })();
  }, [loadForm, loadInitialSubmission, loadTranslations, locationKey, missingSubmissionMethodOnDirectRoute]);

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

  if (loading || loadedLocationKey !== locationKey) {
    return <FormPageSkeleton />;
  }

  if (!translations || !form || !navForm) {
    return <NotFoundPage />;
  }

  if (submissionMethod && !navFormUtils.isSubmissionMethodAllowed(submissionMethod, navForm)) {
    return <SubmissionMethodNotAllowed submissionMethod={submissionMethod} />;
  }

  return (
    <LanguagesProvider translations={translations}>
      {useNewRenderer && !useLegacyPageForNewRenderer ? (
        <RenderForm form={form} initialSubmission={initialSubmission} initialInnsendingsId={initialInnsendingsId} />
      ) : (
        <FyllUtRouter form={navForm} />
      )}
    </LanguagesProvider>
  );
};

export default FormPageWrapper;
