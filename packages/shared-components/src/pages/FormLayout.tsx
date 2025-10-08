import { Outlet } from 'react-router';
import { FormContainer } from '../components/form/container/FormContainer';
import FormStepper from '../components/form/form-stepper/FormStepper';
import { FormTitle } from '../components/form/form-title/FormTitle';
import { useForm } from '../context/form/FormContext';
import { LanguageSelector } from '../context/languages';

interface Props {
  stepper?: boolean;
}

const FormLayout = ({ stepper }: Props) => {
  const { form } = useForm();

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
