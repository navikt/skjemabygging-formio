import { Navigate, useSearchParams } from 'react-router-dom';
import { useForm } from '../../../context/form/FormContext';
import { useSendInn } from '../../../context/sendInn/sendInnContext';

/**
 * Shoudl concider delete this and handle this logic somewhere else.
 */
export const SubmissionWrapper = ({ children }) => {
  const { isMellomlagringAvailable } = useSendInn();
  const { submission, formUrl } = useForm();
  const [searchParams] = useSearchParams();
  const innsendingsId = searchParams.get('innsendingsId');

  if (!submission && isMellomlagringAvailable && !innsendingsId) {
    searchParams.delete('innsendingsId');
    return <Navigate to={`${formUrl}?${searchParams.toString()}`} />;
  }

  return <>{children}</>;
};
