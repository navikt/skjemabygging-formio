import { Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';
import { To, useLocation } from 'react-router';
import { useLanguages } from '../../../context/languages';
import { useSendInn } from '../../../context/sendInn/sendInnContext';
import { CancelButton } from '../../navigation/CancelButton';
import { NavigationButtonRow } from '../../navigation/NavigationButtonRow';
import { NextButton } from '../../navigation/NextButton';
import { PreviousButton } from '../../navigation/PreviousButton';
import { SaveButton } from '../../navigation/SaveButton';

export interface Props {
  isValid: () => Promise<boolean>;
  submission?: Submission;
  navigateTo: (to: To) => void;
  finalStep?: string;
  paths: {
    prev?: string;
    next?: string;
  };
}

const FormNavigation = ({ paths, isValid, submission, navigateTo, finalStep }: Props) => {
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

  const nextClickHandler = useCallback(async () => {
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
  }, [isMellomlagringActive, isValid, navigateTo, nextLocation, submission, updateMellomlagring]);

  const prevClickHandler = useCallback(async () => {
    if (!prevLocation) {
      return false;
    }
    navigateTo(prevLocation);
    return true;
  }, [navigateTo, prevLocation]);

  return (
    <NavigationButtonRow
      nextButton={
        <NextButton
          onClick={{
            digital: () => nextClickHandler(),
            paper: () => nextClickHandler(),
            digitalnologin: () => nextClickHandler(),
            none: () => nextClickHandler(),
          }}
          label={{
            digital: translate(TEXTS.grensesnitt.navigation.saveAndContinue),
            digitalnologin: translate(TEXTS.grensesnitt.navigation.next),
            paper: translate(TEXTS.grensesnitt.navigation.next),
            none: translate(TEXTS.grensesnitt.navigation.next),
          }}
        />
      }
      previousButton={
        <PreviousButton
          onClick={{
            digital: () => prevClickHandler(),
            digitalnologin: () => prevClickHandler(),
            paper: () => prevClickHandler(),
          }}
          label={{
            digital: translate(TEXTS.grensesnitt.navigation.previous),
            digitalnologin: translate(TEXTS.grensesnitt.navigation.previous),
            paper: translate(TEXTS.grensesnitt.navigation.previous),
            none: translate(TEXTS.grensesnitt.navigation.previous),
          }}
        />
      }
      cancelButton={<CancelButton />}
      saveButton={isMellomlagringActive && submission && <SaveButton submission={submission} />}
    />
  );
};

export default FormNavigation;
