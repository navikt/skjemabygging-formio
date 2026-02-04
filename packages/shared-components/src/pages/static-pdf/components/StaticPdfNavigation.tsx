import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import NavigationButtonRow from '../../../components/navigation/NavigationButtonRow';
import { NextButton } from '../../../components/navigation/NextButton';
import { PreviousButton } from '../../../components/navigation/PreviousButton';
import { useLanguages } from '../../../context/languages';
import { useInputValidation } from '../../../context/validator/InputValidationContext';
import type StaticPdfPage from '../StaticPdfWrapper';
import CancelStaticPdfButton from './buttons/CancelStaticPdfButton';

interface Props {
  page: StaticPdfPage;
  setPage: (page: StaticPdfPage) => void;
}

const StaticPdfNavigation = ({ page, setPage }: Props) => {
  const { isValid } = useInputValidation();
  const { translate } = useLanguages();

  return (
    <NavigationButtonRow
      nextButton={
        page === 'input' && (
          <NextButton
            onClick={{
              default: () => {
                if (isValid()) {
                  setPage('download');
                }
              },
            }}
            label={{
              default: translate(TEXTS.grensesnitt.navigation.continue),
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
              default: translate(TEXTS.grensesnitt.navigation.prevPage),
            }}
          />
        )
      }
      cancelButton={<CancelStaticPdfButton page={page} />}
    />
  );
};

export default StaticPdfNavigation;
