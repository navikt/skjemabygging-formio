import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { FormContainer } from '../components/form/container/FormContainer';
import FormStepper from '../components/form/form-stepper/FormStepper';
import { FormTitle } from '../components/form/form-title/FormTitle';
import { useForm } from '../context/form/FormContext';
import { LanguageSelector } from '../context/languages';
import { useSendInn } from '../context/sendInn/sendInnContext';

interface Props {
  stepper?: boolean;
}

const FormLayout = ({ stepper }: Props) => {
  const { form, submission } = useForm();
  const { startMellomlagring, isMellomlagringAvailable } = useSendInn();

  useEffect(() => {
    (async () => {
      if (isMellomlagringAvailable) {
        await startMellomlagring(submission!);
      }
    })();
  }, [submission, startMellomlagring, isMellomlagringAvailable]);

  return (
    <FormContainer>
      <LanguageSelector />
      <FormTitle form={form} hideIconOnMobile={true} />
      {stepper && <FormStepper />}

      <Outlet />
    </FormContainer>
  );
};

export default FormLayout;
