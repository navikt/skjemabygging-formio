import { ComponentError, NavFormType, Submission, Webform } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppConfig } from '../../context/config/configContext';
import { usePrefillData } from '../../context/prefill-data/PrefillDataContext';
import Styles from '../../styles';
import makeStyles from '../../util/styles/jss/jss';
import i18nData from '../../util/translation/i18nData';
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
  url?: string;
  submission?: Submission;
  i18n?: any;
  language?: string;
  fyllutEvents?: any;
  formReady?: (formioInstance: any) => void;
  submissionReady?: (formioInstance: any) => void;
  events?: EventProps;
}

/**
 * Create a new instance of a formio Webform
 */
const NavForm = ({
  form,
  src,
  url,
  language = 'nb-NO',
  i18n = i18nData,
  fyllutEvents,
  formReady,
  submission,
  submissionReady,
  className,
  events,
}: Props) => {
  useStyles();
  const [webform, setWebform] = useState<Webform>();
  const { prefillData } = usePrefillData();
  const appConfig = useAppConfig();
  const ref = useRef(null);

  const onAnyEvent = useCallback(
    (event: string, ...args: any[]) => {
      appConfig.logger?.trace(`formio event '${event}'`, { webformId: webform?.id, eventArgs: args });
      if (event.startsWith('formio.')) {
        const funcName = `on${event.charAt(7).toUpperCase()}${event.slice(8)}`;
        console.log(`formio event '${event}'`, { webformId: webform?.id, eventArgs: args, id: funcName });
        if (events && funcName in events) {
          events[funcName](...args);
        }
      }

      // TODO: Is this needed?
      // Repopulating form from submission after navigating back to form from another context (e.g. Summary page)
      if (submissionReady && event === 'formio.change' && args?.some((arg) => arg?.fromSubmission)) {
        submissionReady(webform);
      }
    },
    [webform, appConfig.logger, submissionReady],
  );

  const createForm = useCallback(
    async (srcOrForm: NavFormType | string) => {
      if (ref?.current) {
        const newWebform = await NavFormBuilder.create(ref.current, srcOrForm, {
          language,
          i18n,
          appConfig,
        });

        appConfig.logger?.debug('Form ready', { newWebformId: newWebform.id, oldWebformId: webform?.id });

        // TODO: Is this needed?
        if (!newWebform.src && !src) {
          newWebform.src = src;
        }

        // TODO: Is this needed?
        if (!newWebform.url && !url) {
          newWebform.url = url;
        }

        // TODO: Is this needed?
        if (!newWebform.form && !form) {
          newWebform.form = form;
        }

        setWebform(newWebform);

        newWebform.onAny(onAnyEvent);

        if (submission) {
          await newWebform.setSubmission(JSON.parse(JSON.stringify(submission)));
        }

        if (formReady) {
          formReady(newWebform);
        }
      }
    },
    [appConfig, webform?.id, src, language, i18n, form, url, onAnyEvent, submission, formReady],
  );

  useEffect(() => {
    if (webform) {
      fyllutEvents?.on('focusOnComponent', (args) => webform.focusOnComponent(args));
      return () => fyllutEvents?.removeListener('focusOnComponent');
    }
  }, [fyllutEvents, webform]);

  useEffect(() => {
    if (Object.keys(i18n).length !== 0 && !webform) {
      appConfig.logger?.debug('Create new webform/wizard');
      if (form) {
        createForm(form);
      } else if (src) {
        createForm(src);
      }
    }
  }, [appConfig.logger, i18n, createForm, webform, src, form, language]);

  useEffect(
    () => () => {
      if (webform) {
        appConfig.logger?.debug('Destroy formio on unmount', { webformId: webform.id });
        webform.destroy(true);
      }
    },
    [appConfig.logger, webform],
  );

  useEffect(() => {
    if (webform) {
      appConfig.logger?.debug('Set language', { webformId: webform?.id, language });
      webform.language = language;
    }
  }, [appConfig.logger, webform, language]);

  useEffect(() => {
    if (webform) {
      if (submission) {
        const updateSubmission = async () => {
          appConfig.logger?.debug('Set submission', { webformId: webform?.id });
          await webform.setSubmission(JSON.parse(JSON.stringify(submission)));

          if (submission?.fyllutState) {
            webform.redrawNavigation();
          }
        };

        updateSubmission();
      }
    }
  }, [submission, webform, appConfig.logger]);

  useEffect(() => {
    if (webform) {
      appConfig.logger?.debug('Prefill data and set form if prefill data exist', {
        webformId: webform?.id,
        prefillData,
      });
      NavFormBuilder.prefillForm(webform, prefillData);
    }
  }, [prefillData, webform, appConfig.logger]);

  return <div className={className} data-testid="formMountElement" ref={ref} />;
};

export default NavForm;
