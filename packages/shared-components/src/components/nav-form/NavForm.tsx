import { ComponentError, NavFormType, Submission, Webform } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppConfig } from '../../context/config/configContext';
import { usePrefillData } from '../../context/prefill-data/PrefillDataContext';
import { i18nUtils } from '../../index';
import Styles from '../../styles';
import makeStyles from '../../util/styles/jss/jss';
import NavFormBuilder from './NavFormBuilder';

const useStyles = makeStyles({
  '@global': Styles.form,
});

interface EventProps {
  onCustomEvent?: () => void;
  onComponentChange?: () => void;
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
  onWizardPageSelected?: (panel: { path: string }) => void;
  onShowErrors?: (errorsFromForm: ComponentError[]) => void;
  onErrorSummaryFocus?: () => void;
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
}: Props) => {
  useStyles();
  const [webform, setWebform] = useState<Webform>();
  const { prefillData } = usePrefillData();
  const appConfig = useAppConfig();
  const ref = useRef(null);
  const { panelSlug } = useParams();
  // This param is used to avoid creating two formio instances in React.StrictMode
  let webformStart = false;

  /**
   * Create a new instance of a formio Webform
   */
  const createForm = useCallback(
    async (srcOrForm?: NavFormType | string) => {
      if (ref?.current && srcOrForm) {
        const newWebform = await NavFormBuilder.create(ref.current, srcOrForm, {
          language,
          i18n,
          appConfig,
          submission: submission ? JSON.parse(JSON.stringify(submission)) : undefined,
        });

        appConfig.logger?.debug('Form ready', { newWebformId: newWebform.id, oldWebformId: webform?.id });

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
      appConfig.logger?.trace(`Update new slug ${panelSlug}`);
      if (panelIndex >= 0) {
        webform.setPage(panelIndex);
      } else {
        webform.setPage(0);
      }
    }
  }, [appConfig.logger, webform, panelSlug]);

  /**
   * Handle focusOnComponent
   */
  useEffect(() => {
    if (webform) {
      appConfig.logger?.trace('Setup focusOnComponent');
      fyllutEvents?.on('focusOnComponent', (args) => webform.focusOnComponent(args));
      return () => {
        appConfig.logger?.debug('Remove focusOnComponent');
        fyllutEvents?.removeListener('focusOnComponent');
      };
    }
  }, [appConfig.logger, webform, fyllutEvents]);

  /**
   * Update form when the user change language
   */
  useEffect(() => {
    if (webform) {
      appConfig.logger?.debug('Set language', { webformId: webform?.id, language });
      webform.language = language;
    }
  }, [appConfig.logger, webform, language]);

  /**
   * Prefill the form with data
   */
  useEffect(() => {
    if (webform) {
      appConfig.logger?.debug('Prefill data and set form if prefill data exist', {
        webformId: webform?.id,
        prefillData,
      });
      NavFormBuilder.prefillForm(webform, prefillData);
    }
  }, [appConfig.logger, webform, prefillData]);

  /**
   * This is needed to refresh the last saved status and error message from mellomlagring.
   * If we move buttons, error message and the save status to React, this can be removed.
   */
  useEffect(() => {
    (async () => {
      if (webform && submission) {
        webform.submission = JSON.parse(JSON.stringify(submission));
      }
    })();
  }, [appConfig.logger, webform, submission]);

  /**
   * Initialize the form
   */
  useEffect(() => {
    (async () => {
      if (Object.keys(i18n).length !== 0 && !webform && !webformStart) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        webformStart = true;
        await createForm(form || src);
      }
    })();
  }, [appConfig.logger, i18n, createForm, webform, src, form]);

  return <div className={className} data-testid="formMountElement" ref={ref} />;
};

export default NavForm;
