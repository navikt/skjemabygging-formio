import { Navigate, useSearchParams } from 'react-router-dom';
import { useSendInn } from '../../../context/sendInn/sendInnContext';
import { LoadingComponent } from '../../../index';

export const SubmissionWrapper = ({ submission, children, url }) => {
  const { isMellomlagringAvailable } = useSendInn();
  const [searchParams] = useSearchParams();
  const innsendingsId = searchParams.get('innsendingsId');

  if (!submission && isMellomlagringAvailable) {
    if (!innsendingsId) {
      searchParams.delete('innsendingsId');
      return <Navigate to={`${url}?${searchParams.toString()}`} />;
    } else {
      return <LoadingComponent />;
    }
  }

  return (
    <>
      {children(submission)}
      <div id="formio-summary-hidden" hidden />
    </>
  );
};
