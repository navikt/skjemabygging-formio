import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { FormContainer } from '../components/form/container/FormContainer';
import FormProgress from '../components/form/form-progress/FormProgress';
import { FormTitle } from '../components/form/form-title/FormTitle';
import { useForm } from '../context/form/FormContext';
import { LanguageSelector, useLanguages } from '../context/languages';
import { useSendInn } from '../context/sendInn/sendInnContext';
import { scrollToAndSetFocus } from '../util/focus-management/focus-management';

interface Props {
  allowSubmittedApplication?: boolean;
}

const FormLayout = ({ allowSubmittedApplication = false }: Props) => {
  const { form, formProgressVisible, title } = useForm();
  const { submitted } = useSendInn();
  const { translate } = useLanguages();
  const location = useLocation();

  const initialPageLoad = useRef(true);

  console.log('Layout', initialPageLoad.current);
  useEffect(() => {
    console.log('Set focus', initialPageLoad.current);
    if (initialPageLoad.current) {
      initialPageLoad.current = false;
    } else {
      scrollToAndSetFocus('h2', 'start');
    }
  }, [location]);

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
