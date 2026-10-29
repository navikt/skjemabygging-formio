import {
  normalizeSendinnAttachmentFilter,
  sendinnEntryUtils,
  sendinnLanguageUtils,
  Submission,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router';
import { useAppConfig } from '../../app/config/AppConfigProvider';
import { ApplicationProvider } from '../../context/application/ApplicationContext';
import { FormDefinitionProvider, useFormDefinitionForm } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { RuntimeServicesProvider } from '../../context/runtime-services/RuntimeServicesContext';
import { SubmissionStateProvider } from '../../context/state/SubmissionStateContext';
import FormValidationProvider from '../../form-components/page-validation/FormValidationProvider';
import { collectSendinnAttachmentValidationFields } from '../journey/sendinnAttachmentValidation';
import { SendinnJourney } from '../journey/SendinnJourney';
import { LoadSendinnForm } from './createSendinnFormService';
import { CreateSendinnCoverPage, createSendinnRuntimeServices } from './createSendinnRuntimeServices';
import { SendinnFormProvider, useSendinnForm } from './SendinnFormProvider';

interface Props {
  formPath: string;
  loadForm: LoadSendinnForm;
  onLoadError: (error: unknown) => void;
}

const SendinnValidationProvider = ({ children }: { children: ReactNode }) => {
  const form = useFormDefinitionForm();
  const { currentLanguage } = useLanguage();
  const resolveSpecialPageFields = useCallback(
    (pageKey: string, submission?: Submission) =>
      pageKey === 'sendinnAttachments'
        ? collectSendinnAttachmentValidationFields({ form, submission, currentLanguage })
        : undefined,
    [form, currentLanguage],
  );
  return (
    <FormValidationProvider resolveSpecialPageFields={resolveSpecialPageFields}>{children}</FormValidationProvider>
  );
};

const LoadedForm = ({ createCoverPage }: { createCoverPage: CreateSendinnCoverPage }) => {
  const { form } = useSendinnForm();
  return (
    <FormDefinitionProvider form={form} submissionMethod="paper">
      <SendinnValidationProvider>
        <SendinnJourney createCoverPage={createCoverPage} />
      </SendinnValidationProvider>
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
            <LoadedForm createCoverPage={services.coverPage.create} />
          </SendinnFormProvider>
        </SubmissionStateProvider>
      </RuntimeServicesProvider>
    </ApplicationProvider>
  );
};

export { SendinnFormEntry };
