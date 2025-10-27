import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { Outlet } from 'react-router';
import { FormContainer } from '../components/form/container/FormContainer';
import FormProgress from '../components/form/form-progress/FormProgress';
import { FormTitle } from '../components/form/form-title/FormTitle';
import { useForm } from '../context/form/FormContext';
import { LanguageSelector, useLanguages } from '../context/languages';
import { useSendInn } from '../context/sendInn/sendInnContext';

interface Props {
  allowSubmittedApplication?: boolean;
}

const FormLayout = ({ allowSubmittedApplication = false }: Props) => {
  const { form, formProgressVisible, title } = useForm();
  const { submitted } = useSendInn();
  const { translate } = useLanguages();

  return (
    <FormContainer>
      <LanguageSelector />
      <FormTitle form={form} hideIconOnMobile={true} title={title} />
      {!allowSubmittedApplication && submitted ? (
        <div>{translate(TEXTS.statiske.error.alreadySubmitted)}</div>
      ) : (
        <>
          {formProgressVisible && <FormProgress />}

          <Outlet />
        </>
      )}
    </FormContainer>
  );
};

export default FormLayout;
