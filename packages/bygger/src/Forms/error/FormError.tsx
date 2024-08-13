import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import FormErrorBody from './FormErrorBody';

export type FormErrorType = 'FORMS_ERROR' | 'FORM_ERROR' | 'FORM_NOT_FOUND';

interface Props {
  type: FormErrorType;
  layout?: boolean;
}

const FormError = ({ type, layout = true }: Props) => {
  if (layout) {
    return (
      <AppLayout>
        <RowLayout>
          <FormErrorBody type={type} />
        </RowLayout>
      </AppLayout>
    );
  } else {
    return <FormErrorBody type={type} />;
  }
};

export default FormError;
