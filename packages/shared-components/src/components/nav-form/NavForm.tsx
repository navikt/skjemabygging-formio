import {
  ComponentError,
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
  onChange?: (changedSubmission: Submission) => void;
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
}: Props) => {
  useStyles();
  const [webform, setWebform] = useState<Webform>();
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
          oldWebformId: webform?.id,
          language,
          submission,
        });

        events?.onReady?.();
        setWebform(newWebform);
      }
    },
    [appConfig, webform, language, i18n, submission],
  );

  /**
   * Handle events from formio and destroy the webform instance on unmount.
   */
  useEffect(() => {
    (async () => {
      if (webform) {
        webform.onAny((event: string, ...args: any[]) => {
          appConfig.logger?.trace(`Formio event '${event}'`, { webformId: webform?.id, eventArgs: args });
          if (event.startsWith('formio.')) {
            const funcName = `on${event.charAt(7).toUpperCase()}${event.slice(8)}`;
            if (events && funcName in events) {
              events[funcName](...args);
            }
          }
        });
      }
    })();

    return () => {
      if (webform) {
        appConfig.logger?.debug('Destroy formio on unmount', { webformId: webform.id });
        webform.destroy(true);
      }
    };
    // Do not want to include events in the dependency array
    // eslint-disable-next-line
  }, [appConfig.logger, webform]);

  /**
   * Set the correct formio page based on url changes (panelSlug)
   */
  useEffect(() => {
    if (webform && panelSlug && webform.currentPanel?.key !== panelSlug) {
      const panelIndex = webform.currentPanels.indexOf(panelSlug);
      appConfig.logger?.trace(`Update new slug: ${panelSlug}`);
      if (panelIndex >= 0) {
        webform.setPage(panelIndex);
      } else {
        webform.setPage(0);
      }
    }
  }, [appConfig.logger, webform, panelSlug]);

  useEffect(() => {
    webform?.emitNavigationPathsChanged?.();
    webform?.emit('submissionChanged', webform._data);
  }, [webform]);

  /**
   * Handle fyllut events (focusOnComponent, validateOnNextPage)
   */
  useEffect(() => {
    if (webform) {
      appConfig.logger?.trace('Setup fyllut events');
      fyllutEvents?.on('focusOnComponent', (args) => webform.focusOnComponent(args));
      fyllutEvents?.on('validateOnNextPage', ({ validationResultCallback }) => {
        appConfig.logger?.trace(`Fyllut event 'validateOnNextPage'`);
        webform.validateOnNextPage(validationResultCallback);
      });
      return () => {
        appConfig.logger?.debug('Remove fyllut events');
        fyllutEvents?.removeListener('focusOnComponent');
        fyllutEvents?.removeListener('validateOnNextPage');
      };
    }
  }, [appConfig.logger, webform, fyllutEvents]);

  /**
   * Update form when the user change language
   */
  useEffect(() => {
    if (webform && webform?.language !== language) {
      appConfig.logger?.debug('Set language', { webformId: webform?.id, language });
      webform.language = language;
    }
  }, [appConfig.logger, webform, language]);

  /**
   * Prefill the form with data
   */
  useEffect(() => {
    if (webform?.form && prefillData && Object.keys(prefillData).length > 0) {
      appConfig.logger?.debug('Prefill data and set form if prefill data exist', {
        webformId: webform?.id,
        prefillData,
      });
      webform.form = NavFormHelper.prefillForm(webform.form, prefillData);

      // Need to trigger a handle change event after prefilling form or else
      // submission will not have correct initial state.
      if (events?.onSubmissionChanged) {
        events.onSubmissionChanged(webform._data);
      }
      webform.emitNavigationPathsChanged();
    }
    // Do not want to include events in the dependency array
    // eslint-disable-next-line
  }, [appConfig.logger, webform, prefillData]);

  /**
   * Initialize the form
   */
  useEffect(() => {
    (async () => {
      if (Object.keys(i18n).length !== 0 && !webform && !webformStartRef.current) {
        webformStartRef.current = true;
        await createForm(form || src);
      }
    })();
  }, [appConfig.logger, i18n, createForm, webform, src, form]);

  useEffect(() => {
    if (webform && hash) {
      const fragmentPath = hash.substring(1);
      webform.focusOnComponent({ path: decodeURIComponent(fragmentPath) });
    }
  }, [webform, hash]);

  return <div className={className} data-testid="formMountElement" ref={ref} />;
};

export default NavForm;
