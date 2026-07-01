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
import makeStyles from '../util/styles/jss/jss';

interface Props {
  allowSubmittedApplication?: boolean;
}

const useStyles = makeStyles({
  hideOnPrint: {
    '@media print': {
      display: 'none !important',
    },
  },
});

const FormLayout = ({ allowSubmittedApplication = false }: Props) => {
  const { form, formProgressVisible, title } = useForm();
  const { submitted } = useSendInn();
  const { translate } = useLanguages();
  const location = useLocation();
  const styles = useStyles();

  const initialPageLoad = useRef(true);
  const isReceiptPage = location.pathname.endsWith('/kvittering');

  useEffect(() => {
    if (initialPageLoad.current) {
      initialPageLoad.current = false;
    } else {
      scrollToAndSetFocus('#page-title', 'start');
    }
  }, [location]);

  return (
    <FormContainer>
      <div className={isReceiptPage ? styles.hideOnPrint : undefined}>
        <LanguageSelector />
        <FormTitle form={form} hideIconOnMobile={true} title={title} />
      </div>
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
