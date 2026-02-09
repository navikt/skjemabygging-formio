import {
  ComponentError,
  FormioChangeEvent,
  NavFormType,
  Submission,
  SubmissionData,
  SubmissionMetadata,
  Webform,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { i18nUtils } from '../../index';
import Styles from '../../styles';
import makeStyles from '../../util/styles/jss/jss';
import NavFormHelper from './NavFormHelper';

const useStyles = makeStyles({
  '@global': Styles.form,
});

export interface FormNavigationPaths {
  prev?: string;
  curr?: string;
  next?: string;
}

interface EventProps {
  onCustomEvent?: () => void;
  onSubmit?: (submission: any) => void;
  onSubmitDone?: () => void;
  onNextPage?: ({
    page,
    currentPanels,
    submission,
  }: {
    page: number;
    currentPanels: string[];
    submission: Submission;
  }) => void;
  onPrevPage?: ({ page, currentPanels }: { page: number; currentPanels: string[] }) => void;
  onCancel?: ({ submission }: { submission: Submission }) => void;
  onSave?: ({ submission }: { submission: Submission }) => void;
  onChange?: (changeEvent: FormioChangeEvent) => void;
  onSubmissionChanged?: (submissionData: SubmissionData) => void;
  onSubmissionMetadataChanged?: (submissionMetadata: SubmissionMetadata) => void;
  onWizardPageSelected?: (panel: { path: string }) => void;
  onShowErrors?: (errorsFromForm: ComponentError[]) => void;
  onErrorSummaryFocus?: () => void;
  onReady?: () => void;
  onNavigationPathsChanged?: (paths: FormNavigationPaths) => void;
  onFocusOnComponentPageChanged?: (page: { key: string }) => void;
}

interface Props {
  className?: string;
  form?: NavFormType;
  src?: string;
  submission?: Submission;
  i18n?: any;
  language?: string;
  fyllutEvents?: any;
  events?: EventProps;
  hash?: string;
  setTitle?: (title: string) => void;
}

/**
 * Create a new instance of a formio Webform
 */
const NavForm = ({
  form,
  src,
  language = 'nb-NO',
  i18n = i18nUtils.initialData,
  fyllutEvents,
  submission,
  className,
  events,
  hash,
  setTitle,
}: Props) => {
  useStyles();
  const webformRef = useRef<Webform>();
  const [webformVersion, setWebformVersion] = useState(0);
  const { prefillData } = useForm();
  const appConfig = useAppConfig();
  const ref = useRef(null);
  const { panelSlug } = useParams();
  // This param is used to avoid creating two formio instances in React.StrictMode
  const webformStartRef = useRef(false);

  /**
   * Create a new instance of a formio Webform
   */
  const createForm = useCallback(
    async (srcOrForm?: NavFormType | string) => {
      if (ref?.current && srcOrForm) {
        const newWebform = await NavFormHelper.create(ref.current, srcOrForm, {
          language,
          i18n,
          appConfig,
          submission: submission ? JSON.parse(JSON.stringify(submission)) : undefined,
          panelSlug,
        });

        appConfig.logger?.debug('Form ready', {
          newWebformId: newWebform.id,
          oldWebformId: webformRef.current?.id,
          language,
          submission,
        });

        events?.onReady?.();
        webformRef.current = newWebform;
        setWebformVersion((version) => version + 1);
      }
    },
    [appConfig, events, i18n, language, panelSlug, submission],
  );

  /**
   * Handle events from formio and destroy the webform instance on unmount.
   */
  useEffect(() => {
    const currentWebform = webformRef.current;

    if (currentWebform) {
      currentWebform.onAny((event: string, ...args: any[]) => {
        appConfig.logger?.trace(`Formio event '${event}'`, {
          webformId: currentWebform.id,
          eventArgs: args,
        });
        if (event.startsWith('formio.')) {
          const funcName = `on${event.charAt(7).toUpperCase()}${event.slice(8)}`;
          if (events && funcName in events) {
            events[funcName](...args);
          }
        }
      });
    }

    return () => {
      if (currentWebform) {
        appConfig.logger?.debug('Destroy formio on unmount', { webformId: currentWebform.id });
        currentWebform.destroy(true);
      }
    };
    // Do not want to include events in the dependency array
    // eslint-disable-next-line
  }, [appConfig.logger, webformVersion]);

  /**
   * Set the correct formio page based on url changes (panelSlug)
   */
  useEffect(() => {
    const currentWebform = webformRef.current;

    if (currentWebform && panelSlug && currentWebform.currentPanel?.key !== panelSlug) {
      const panelIndex = currentWebform.currentPanels.indexOf(panelSlug);
      appConfig.logger?.trace(`Update new slug: ${panelSlug}`);
      if (panelIndex >= 0) {
        currentWebform.setPage(panelIndex);
      } else {
        currentWebform.setPage(0);
      }
    }
  }, [appConfig.logger, panelSlug, webformVersion]);

  useEffect(() => {
    const currentWebform = webformRef.current;
    currentWebform?.emitNavigationPathsChanged?.();
    currentWebform?.emit('submissionChanged', currentWebform._data);
  }, [webformVersion]);

  /**
   * Handle fyllut events (focusOnComponent, validateOnNextPage)
   */
  useEffect(() => {
    const currentWebform = webformRef.current;

    if (currentWebform) {
      appConfig.logger?.trace('Setup fyllut events');
      fyllutEvents?.on('focusOnComponent', (args) => currentWebform.focusOnComponent(args));
      fyllutEvents?.on('validateOnNextPage', ({ validationResultCallback }) => {
        appConfig.logger?.trace(`Fyllut event 'validateOnNextPage'`);
        currentWebform.validateOnNextPage(validationResultCallback);
      });
      return () => {
        appConfig.logger?.debug('Remove fyllut events');
        fyllutEvents?.removeListener('focusOnComponent');
        fyllutEvents?.removeListener('validateOnNextPage');
      };
    }
  }, [appConfig.logger, fyllutEvents, webformVersion]);

  /**
   * Update form when the user change language
   */
  useEffect(() => {
    const currentWebform = webformRef.current;

    if (currentWebform && currentWebform.language !== language) {
      appConfig.logger?.debug('Set language', { webformId: currentWebform.id, language });
      currentWebform.language = language;
    }
  }, [appConfig.logger, language, webformVersion]);

  /**
   * Prefill the form with data
   */
  useEffect(() => {
    const currentWebform = webformRef.current;

    if (currentWebform?.form && prefillData && Object.keys(prefillData).length > 0) {
      appConfig.logger?.debug('Prefill data and set form if prefill data exist', {
        webformId: currentWebform.id,
        prefillData,
      });
      currentWebform.form = NavFormHelper.prefillForm(currentWebform.form, prefillData);

      // Need to trigger a handle change event after prefilling form or else
      // submission will not have correct initial state.
      if (events?.onSubmissionChanged) {
        events.onSubmissionChanged(currentWebform._data);
      }
      currentWebform.emitNavigationPathsChanged();
    }
    // Do not want to include events in the dependency array
    // eslint-disable-next-line
  }, [appConfig.logger, prefillData, webformVersion]);

  /**
   * Initialize the form
   */
  useEffect(() => {
    (async () => {
      if (Object.keys(i18n).length !== 0 && !webformRef.current && !webformStartRef.current) {
        webformStartRef.current = true;
        await createForm(form || src);
      }
    })();
  }, [createForm, form, i18n, src]);

  useEffect(() => {
    const currentWebform = webformRef.current;

    if (currentWebform && hash) {
      const fragmentPath = hash.substring(1);
      currentWebform.focusOnComponent({ path: decodeURIComponent(fragmentPath) });
    }
  }, [hash, webformVersion]);

  useEffect(() => {
    const currentWebform = webformRef.current;

    if (currentWebform?.currentPanel?.title && setTitle) {
      setTitle(currentWebform.currentPanel.title);
    }
  }, [setTitle, webformVersion]);

  return <div className={className} data-testid="formMountElement" ref={ref} />;
};

export default NavForm;
