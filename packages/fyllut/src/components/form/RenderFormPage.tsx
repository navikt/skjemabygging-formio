import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import {
  Form,
  FormsApiTranslationMap,
  navFormUtils,
  Submission,
  SubmissionData,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import {
  applyPrefillDataToForm,
  getFormPrefillKeys,
  initializeDigitalDraft,
  resolveDefaultSubmissionMethod,
  RuntimeServices,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import createRuntimeServices from '../../adapter-services/createRuntimeServices';
import useFormsApiForms from '../../api/useFormsApiForms';
import { loadNewRendererTranslations } from '../../api/useTranslations';
import { NotFoundPage } from '../errors/NotFoundPage';
import SubmissionMethodNotAllowed from '../SubmissionMethodNotAllowed';
import FormPageSkeleton from './FormPageSkeleton';
import RenderFormAdapter from './RenderFormAdapter';

type ReadyPage = {
  status: 'ready';
  loadKey: string;
  form: Form;
  translations: FormsApiTranslationMap;
  initialSubmission?: Submission;
  initialInnsendingsId?: string;
  initialLanguage?: TranslationLang;
};

type PageState = { status: 'loading' } | { status: 'notFound'; loadKey: string } | ReadyPage;

type LoadResult =
  | { type: 'ready'; page: ReadyPage }
  | { type: 'notFound' }
  | { type: 'draftNotFound' }
  | { type: 'redirect'; pathname?: string; search: string };

const buildSearchWithSubmissionMethod = (search: string, submissionMethod: string) => {
  const searchParams = new URLSearchParams(search);
  searchParams.set('sub', submissionMethod);
  return `?${searchParams.toString()}`;
};

const RenderFormPage = () => {
  const { formPath, '*': routePath } = useParams();
  const { search, state: locationState } = useLocation();
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<PageState>({ status: 'loading' });
  const loadRef = useRef<{ key: string; promise: Promise<LoadResult> }>();
  const { get } = useFormsApiForms();
  const appConfig = useAppConfig();
  const { submissionMethod, http, baseUrl } = appConfig;
  const backendBaseUrl = baseUrl ?? '/fyllut';
  const innsendingsId = new URLSearchParams(search).get('innsendingsId') ?? undefined;
  const services = useMemo<RuntimeServices>(() => {
    if (!http) {
      throw new Error('Fyllut HTTP client is required to render the form.');
    }
    return createRuntimeServices({ http, backendBaseUrl, innsendingsId });
  }, [backendBaseUrl, http, innsendingsId]);
  const forceMellomlagring = new URLSearchParams(search).get('forceMellomlagring') === 'true';
  const loadKey = `${formPath ?? ''}|${submissionMethod ?? ''}|${innsendingsId ?? ''}|${forceMellomlagring}`;

  useEffect(() => {
    if (!formPath) {
      return;
    }

    if (loadRef.current?.key !== loadKey) {
      const load = async (): Promise<LoadResult> => {
        const [formData, translations] = await Promise.all([
          get(
            formPath,
            'title,skjemanummer,path,revision,introPage,components,properties,publishedLanguages,firstPanelSlug',
          ),
          loadNewRendererTranslations(formPath),
        ]);

        if (!formData || !translations) {
          return { type: 'notFound' };
        }

        const defaultSubmissionMethod = resolveDefaultSubmissionMethod(formData.properties.submissionTypes);
        if (!!routePath && !new URLSearchParams(search).has('sub') && defaultSubmissionMethod === 'paper') {
          return {
            type: 'redirect',
            search: buildSearchWithSubmissionMethod(search, defaultSubmissionMethod),
          };
        }

        const prefillKeys = submissionMethod === 'digital' ? getFormPrefillKeys(formData) : [];
        const prefillData =
          submissionMethod === 'digital' && prefillKeys.length > 0
            ? await http?.get<SubmissionData>(
                `${backendBaseUrl}/api/send-inn/prefill-data?properties=${prefillKeys.join(',')}`,
              )
            : undefined;
        const form = applyPrefillDataToForm(formData, prefillData);
        const draft = await initializeDigitalDraft({
          applications: services.applications,
          form,
          search,
          submissionMethod,
        });

        if (draft.type === 'notFound') {
          return { type: 'draftNotFound' };
        }
        if (draft.type === 'redirect') {
          return draft;
        }

        return {
          type: 'ready',
          page: {
            status: 'ready',
            loadKey,
            form,
            translations,
            initialSubmission: draft.initialSubmission,
            initialInnsendingsId: draft.initialInnsendingsId,
            initialLanguage: draft.initialLanguage,
          },
        };
      };

      loadRef.current = { key: loadKey, promise: load() };
    }

    let active = true;

    loadRef.current.promise
      .then((result) => {
        if (!active) {
          return;
        }

        switch (result.type) {
          case 'ready':
            setPageState(result.page);
            return;
          case 'notFound':
            setPageState({ status: 'notFound', loadKey });
            return;
          case 'draftNotFound':
            navigate('/soknad-ikke-funnet', { replace: true });
            return;
          case 'redirect':
            navigate({ pathname: result.pathname, search: result.search }, { replace: true });
        }
      })
      .catch(() => {
        if (active) {
          setPageState({ status: 'notFound', loadKey });
        }
      });

    return () => {
      active = false;
    };
  }, [
    backendBaseUrl,
    formPath,
    get,
    http,
    loadKey,
    navigate,
    routePath,
    search,
    services.applications,
    submissionMethod,
  ]);

  const form = pageState.status === 'ready' ? pageState.form : undefined;

  useEffect(() => {
    const metaPropOgTitle = document.querySelector('meta[property="og:title"]');
    const metaNameDescr = document.querySelector('meta[name="description"]');
    const metaNameOgDescr = document.querySelector('meta[property="og:description"]');
    const setHeaderProp = (headerObj: Element | null, metaPropValue: string) => {
      headerObj?.setAttribute('content', metaPropValue);
    };

    if (form?.title) {
      document.title = `${form.title} | www.nav.no`;
      setHeaderProp(metaPropOgTitle, `${form.title} | www.nav.no`);
    }

    return () => {
      document.title = 'Fyll ut skjema - www.nav.no';
      setHeaderProp(metaPropOgTitle, 'Fyll ut skjema - www.nav.no');
      setHeaderProp(metaNameDescr, 'Nav søknadsskjema');
      setHeaderProp(metaNameOgDescr, 'Nav søknadsskjema');
    };
  }, [form]);

  if (!formPath) {
    return <NotFoundPage />;
  }

  if (pageState.status === 'loading' || pageState.loadKey !== loadKey) {
    return <FormPageSkeleton />;
  }

  if (pageState.status === 'notFound') {
    return <NotFoundPage />;
  }

  if (submissionMethod && !navFormUtils.isSubmissionMethodAllowed(submissionMethod, pageState.form)) {
    return <SubmissionMethodNotAllowed submissionMethod={submissionMethod} />;
  }

  const noLoginInitialSubmission =
    submissionMethod === 'digitalnologin' &&
    typeof locationState === 'object' &&
    locationState &&
    'initialSubmission' in locationState
      ? (locationState.initialSubmission as Submission | undefined)
      : undefined;

  return (
    <RenderFormAdapter
      form={pageState.form}
      translations={pageState.translations}
      services={services}
      initialSubmission={pageState.initialSubmission ?? noLoginInitialSubmission}
      initialInnsendingsId={pageState.initialInnsendingsId}
      initialLanguage={pageState.initialLanguage}
    />
  );
};

export default RenderFormPage;
