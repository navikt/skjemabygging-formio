import { useSearchParams } from 'react-router-dom';
import { useSendInn } from '../../../context/sendInn/sendInnContext';
import { LoadingComponent } from '../../../index';

export const SubmissionWrapper = ({ submission, children }) => {
  const { isMellomlagringAvailable } = useSendInn();
  const [searchParams] = useSearchParams();
  const innsendingsId = searchParams.get('innsendingsId');

  const expectsSavedSubmissionFromMellomlagring = isMellomlagringAvailable && !!innsendingsId;

  if (!submission && expectsSavedSubmissionFromMellomlagring) {
    return <LoadingComponent />;
  }

  return (
    <>
      {children(submission)}
      <div id="formio-summary-hidden" hidden />
    </>
  );
};
