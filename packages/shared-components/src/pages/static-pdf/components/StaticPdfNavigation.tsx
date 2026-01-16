import NavigationButtonRow from '../../../components/navigation/NavigationButtonRow';
import { NextButton } from '../../../components/navigation/NextButton';
import { PreviousButton } from '../../../components/navigation/PreviousButton';
import type StaticPdfPage from '../StaticPdfWrapper';
import StaticPdfCancelButton from './StaticPdfCancelButton';

interface Props {
  page: StaticPdfPage;
  setPage: (page: StaticPdfPage) => void;
}

const StaticPdfNavigation = ({ page, setPage }: Props) => {
  return (
    <NavigationButtonRow
      nextButton={
        page === 'input' && (
          <NextButton
            onClick={{
              default: () => setPage('download'),
            }}
            label={{
              default: 'Fortsett',
            }}
          />
        )
      }
      previousButton={
        page === 'download' && (
          <PreviousButton
            onClick={{
              default: () => setPage('input'),
            }}
            label={{
              default: 'Forrige side',
            }}
          />
        )
      }
      cancelButton={<StaticPdfCancelButton page={page} />}
    />
  );
};

export default StaticPdfNavigation;
