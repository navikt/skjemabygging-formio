import { Box } from '@navikt/ds-react';
import ReadMore from '../../../components/read-more/ReadMore';
import TranslatedDescription from '../../../components/shared/TranslatedDescription';
import { useSubmissionMethod } from '../../../context/submission-method/SubmissionMethodContext';
import { DrivingListDefinition } from '../../component-types';
import { InputComponentProps, resolveReadMore, resolveSubmissionPath } from '../../inputComponentUtils';
import DigitalDrivingList from './DigitalDrivingList';
import PaperDrivingList from './PaperDrivingList';
import { useDrivingListState } from './useDrivingListState';

const InputDrivingList = ({ component, submissionPath }: InputComponentProps<DrivingListDefinition>) => {
  const { submissionMethod } = useSubmissionMethod();
  const statePath = resolveSubmissionPath(component, submissionPath);
  const drivingListState = useDrivingListState(statePath);
  const readMore = resolveReadMore(component);

  if (submissionMethod === 'digital' && drivingListState.status === 'loading') {
    return null;
  }

  return (
    <>
      {component.description && (
        <Box marginBlock="space-0 space-16">
          <TranslatedDescription translationKey={component.description} />
        </Box>
      )}
      {submissionMethod === 'digital' ? (
        <DigitalDrivingList statePath={statePath} {...drivingListState} />
      ) : (
        <PaperDrivingList statePath={statePath} {...drivingListState} />
      )}
      {readMore && <ReadMore {...readMore} />}
    </>
  );
};

export default InputDrivingList;
