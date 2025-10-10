import { Outlet } from 'react-router';
import { FormContainer } from '../components/form/container/FormContainer';
import FormProgress from '../components/form/form-progress/FormProgress';
import { FormTitle } from '../components/form/form-title/FormTitle';
import { useForm } from '../context/form/FormContext';
import { LanguageSelector } from '../context/languages';

const FormLayout = () => {
  const { form, formProgressVisible, title } = useForm();

  return (
    <FormContainer>
      <LanguageSelector />
      <FormTitle form={form} hideIconOnMobile={true} title={title} />
      {formProgressVisible && <FormProgress />}

      <Outlet />
    </FormContainer>
  );
};

export default FormLayout;
