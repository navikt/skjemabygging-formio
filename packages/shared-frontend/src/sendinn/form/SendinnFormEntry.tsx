import {
  flattenComponents,
  normalizeSendinnAttachmentFilter,
  sendinnEntryUtils,
  sendinnLanguageUtils,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useLocation } from 'react-router';
import Alert from '../../components/alert/Alert';
import { useLanguage } from '../../context/language/LanguageContext';
import { JourneyPlaceholder } from '../JourneyPlaceholder';
import { LoadSendinnForm } from './createSendinnFormService';
import { SendinnFormProvider, useSendinnForm } from './SendinnFormProvider';

interface Props {
  formPath: string;
  loadForm: LoadSendinnForm;
  onLoadError: (error: unknown) => void;
}

const LoadedForm = () => {
  const { form } = useSendinnForm();
  const { translate } = useLanguage();
  const hasAttachments = flattenComponents(form.components).some((component) => component.type === 'attachment');

  return (
    <>
      <JourneyPlaceholder journey="form" />
      {!hasAttachments && <Alert variant="info">{translate(TEXTS.statiske.sendinn.noMatchingDocuments)}</Alert>}
    </>
  );
};

const SendinnFormEntry = ({ formPath, loadForm, onLoadError }: Props) => {
  const { pathname, search } = useLocation();
  const request = useMemo(() => {
    const params = new URLSearchParams(search);
    return {
      formPath,
      language: sendinnLanguageUtils.getSelectedLanguage(params),
      attachmentFilter: normalizeSendinnAttachmentFilter(params.getAll('filter')),
    };
  }, [formPath, search]);
  const loginUrl = sendinnEntryUtils.createLoginUrl(`${sendinnEntryUtils.basePath}${pathname}${search}`);

  return (
    <SendinnFormProvider
      key={JSON.stringify(request)}
      request={request}
      loadForm={loadForm}
      onLoadError={onLoadError}
      loginUrl={loginUrl}
    >
      <LoadedForm />
    </SendinnFormProvider>
  );
};

export { SendinnFormEntry };
