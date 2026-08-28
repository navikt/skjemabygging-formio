import { Box } from '@navikt/ds-react';
import { useSubmissionMethod } from '../../context/submission-method/SubmissionMethodContext';
import ReadMore, { ReadMoreProps } from '../read-more/ReadMore';
import TranslatedDescription from '../shared/TranslatedDescription';
import DigitalDrivingList from './DigitalDrivingList';
import PaperDrivingList from './PaperDrivingList';
import { useDrivingListState } from './useDrivingListState';

interface DrivingListProps {
  statePath: string;
  description?: string;
  readMore?: ReadMoreProps;
}

const DrivingList = ({ statePath, description, readMore }: DrivingListProps) => {
  const { submissionMethod } = useSubmissionMethod();
  const drivingListState = useDrivingListState(statePath);

  if (submissionMethod === 'digital' && drivingListState.status === 'loading') {
    return null;
  }

  return (
    <>
      {description && (
        <Box marginBlock="space-0 space-16">
          <TranslatedDescription>{description}</TranslatedDescription>
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

export default DrivingList;
export type { DrivingListProps };
