import { Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';
import { To, useLocation } from 'react-router';
import { useLanguages } from '../../../context/languages';
import { useSendInn } from '../../../context/sendInn/sendInnContext';
import SaveAndDeleteButtons from '../../button/navigation/save-and-delete/SaveAndDeleteButtons';
import { CancelButton } from '../../navigation/CancelButton';
import { NavigationButtonRow } from '../../navigation/NavigationButtonRow';
import { NextButton } from '../../navigation/NextButton';
import { PreviousButton } from '../../navigation/PreviousButton';

export interface Props {
  isValid: () => Promise<boolean>;
  submission?: Submission;
  onCancel: () => void;
  navigateTo: (to: To) => void;
  finalStep?: string;
  paths: {
    prev?: string;
    next?: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FormNavigation = ({ paths, isValid, submission, onCancel, navigateTo, finalStep }: Props) => {
  const { isMellomlagringActive, updateMellomlagring } = useSendInn();
  const { search } = useLocation();
  const { translate } = useLanguages();

  const [nextLocation, setNextLocation] = useState<To | undefined>({
    pathname: `../${paths.next ?? finalStep}`,
    search,
  });
  const [prevLocation, setPrevLocation] = useState<To | undefined>(
    paths.prev ? { pathname: `../${paths.prev}`, search } : undefined,
  );

  useEffect(() => {
    setNextLocation({ pathname: `../${paths.next ?? finalStep}`, search });
  }, [search, paths.next, finalStep]);

  useEffect(() => {
    setPrevLocation(paths.prev ? { pathname: `../${paths.prev}`, search } : undefined);
  }, [search, paths.prev]);

  const nextClickHandler = useCallback(
    async (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      if (!nextLocation) {
        return false;
      }
      const valid = await isValid();
      if (!valid) {
        return false;
      }
      if (isMellomlagringActive && submission) {
        updateMellomlagring(submission).catch((_e) => {});
      }
      navigateTo(nextLocation);
      return true;
    },
    [isMellomlagringActive, isValid, navigateTo, nextLocation, submission, updateMellomlagring],
  );

  const prevClickHandler = useCallback(
    async (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      if (!prevLocation) {
        return false;
      }
      navigateTo(prevLocation);
      return true;
    },
    [navigateTo, prevLocation],
  );

  return (
    <>
      <NavigationButtonRow
        nextButton={
          <NextButton
            onClick={{
              digital: () => nextClickHandler,
              paper: () => nextClickHandler,
              digitalnologin: () => nextClickHandler,
            }}
            label={{
              digital: translate(TEXTS.grensesnitt.navigation.saveAndContinue),
              digitalnologin: translate(TEXTS.grensesnitt.navigation.next),
              paper: translate(TEXTS.grensesnitt.navigation.next),
            }}
          />
        }
        previousButton={
          <PreviousButton
            onClick={{
              digital: () => prevClickHandler,
              digitalnologin: () => prevClickHandler,
              paper: () => prevClickHandler,
            }}
            label={{
              digital: translate(TEXTS.grensesnitt.navigation.previous),
              digitalnologin: translate(TEXTS.grensesnitt.navigation.previous),
              paper: translate(TEXTS.grensesnitt.navigation.previous),
            }}
          />
        }
        cancelButton={<CancelButton />}
        // saveButton={<SaveButton />}
      />
      {isMellomlagringActive && <SaveAndDeleteButtons submission={submission} />}
      {/*{!isMellomlagringActive && (*/}
      {/*  <div className="button-row button-row__center">*/}
      {/*    <Button variant="tertiary" onClick={onCancel}>*/}
      {/*      {translate(TEXTS.grensesnitt.navigation.cancelAndDiscard)}*/}
      {/*    </Button>*/}
      {/*  </div>*/}
      {/*)}*/}
    </>
  );
};

export default FormNavigation;
