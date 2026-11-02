import {
  normalizeSendinnAttachmentFilter,
  sendinnEntryUtils,
  sendinnLanguageUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useLocation } from 'react-router';
import { useAppConfig } from '../../app/config/AppConfigProvider';
import { ApplicationProvider } from '../../context/application/ApplicationContext';
import { FormDefinitionProvider } from '../../context/form-definition/FormDefinitionContext';
import { RuntimeServicesProvider } from '../../context/runtime-services/RuntimeServicesContext';
import { SubmissionStateProvider } from '../../context/state/SubmissionStateContext';
import FormValidationProvider from '../../form-components/page-validation/FormValidationProvider';
import { SendinnJourney } from '../journey/SendinnJourney';
import { LoadSendinnForm } from './createSendinnFormService';
import { createSendinnRuntimeServices } from './createSendinnRuntimeServices';
import { SendinnFormProvider, useSendinnForm } from './SendinnFormProvider';

interface Props {
  formPath: string;
  loadForm: LoadSendinnForm;
  onLoadError: (error: unknown) => void;
}

const LoadedForm = () => {
  const { form } = useSendinnForm();
  return (
    <FormDefinitionProvider form={form} submissionMethod="paper">
      <FormValidationProvider>
        <SendinnJourney />
      </FormValidationProvider>
    </FormDefinitionProvider>
  );
};

const SendinnFormEntry = ({ formPath, loadForm, onLoadError }: Props) => {
  const { pathname, search } = useLocation();
  const { baseUrl, http, config, logger } = useAppConfig();
  const services = useMemo(() => createSendinnRuntimeServices({ baseUrl, http }), [baseUrl, http]);
  const params = new URLSearchParams(search);
  const language = sendinnLanguageUtils.getSelectedLanguage(params);
  const filterKey = JSON.stringify(normalizeSendinnAttachmentFilter(params.getAll('filter')));
  const request = useMemo(() => {
    return {
      formPath,
      language,
      attachmentFilter: JSON.parse(filterKey) as string[],
    };
  }, [formPath, language, filterKey]);
  const loginUrl = sendinnEntryUtils.createLoginUrl(`${sendinnEntryUtils.basePath}${pathname}${search}`);

  return (
    <ApplicationProvider logger={logger} environment={config.isProdGcp ? 'production' : 'development'}>
      <RuntimeServicesProvider services={services}>
        <SubmissionStateProvider key={`${formPath}:${filterKey}`}>
          <SendinnFormProvider
            key={JSON.stringify(request)}
            request={request}
            loadForm={loadForm}
            onLoadError={onLoadError}
            loginUrl={loginUrl}
          >
            <LoadedForm />
          </SendinnFormProvider>
        </SubmissionStateProvider>
      </RuntimeServicesProvider>
    </ApplicationProvider>
  );
};

export { SendinnFormEntry };
