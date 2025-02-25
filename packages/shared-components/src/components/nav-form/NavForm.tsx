import { ComponentError, NavFormType, Submission, Webform } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
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

  const createForm = useCallback(
    async (srcOrForm: NavFormType | string) => {
      if (ref?.current) {
        const newWebform = await NavFormBuilder.create(ref.current, srcOrForm, {
          language,
          i18n,
          appConfig,
          submission: submission ? JSON.parse(JSON.stringify(submission)) : undefined,
        });

        appConfig.logger?.debug('Form ready', { newWebformId: newWebform.id, oldWebformId: webform?.id });

        // TODO: Is this needed?
        if (webform) {
          //webform?.destroy(true);
        }

        // TODO: Is this needed?
        if (!newWebform.src && !src) {
          //newWebform.src = src;
        }

        // TODO: Is this needed?
        if (!newWebform.url && !url) {
          //newWebform.url = url;
        }

        // TODO: Is this needed?
        if (!newWebform.form && !form) {
          //newWebform.form = form;
        }

        setWebform(newWebform);
      }
    },
    [appConfig, webform, language, i18n, src, url, form, submission],
  );

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

  useEffect(() => {
    if (webform) {
      appConfig.logger?.debug('Set language', { webformId: webform?.id, language });
      webform.language = language;
    }
  }, [appConfig.logger, webform, language]);

  useEffect(() => {
    if (webform) {
      appConfig.logger?.debug('Prefill data and set form if prefill data exist', {
        webformId: webform?.id,
        prefillData,
      });
      NavFormBuilder.prefillForm(webform, prefillData);
    }
  }, [appConfig.logger, webform, prefillData]);

  useEffect(() => {
    (async () => {
      if (Object.keys(i18n).length !== 0 && !webform) {
        appConfig.logger?.debug('Create new webform/wizard');
        if (form) {
          await createForm(form);
        } else if (src) {
          await createForm(src);
        }
      }
    })();
  }, [appConfig.logger, i18n, createForm, webform, src, form]);

  return <div className={className} data-testid="formMountElement" ref={ref} />;
};

export default NavForm;
