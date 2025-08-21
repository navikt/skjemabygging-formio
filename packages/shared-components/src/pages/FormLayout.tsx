import { Outlet } from 'react-router-dom';
import { FormContainer } from '../components/form/container/FormContainer';
import FormStepper from '../components/form/form-stepper/FormStepper';
import { FormTitle } from '../components/form/form-title/FormTitle';
import { useForm } from '../context/form/FormContext';
import { LanguageSelector } from '../context/languages';

const FormLayout = () => {
  const { form, formProgressVisible, title } = useForm();

  return (
    <FormContainer>
      <LanguageSelector />
      <FormTitle form={form} hideIconOnMobile={true} title={title} />
      {formProgressVisible && <FormStepper />}

      <Outlet />
    </FormContainer>
  );
};

export default FormLayout;
