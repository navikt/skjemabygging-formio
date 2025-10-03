import { ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';
import { To, useLocation } from 'react-router';
import { useLanguages } from '../../../context/languages';
import { useSendInn } from '../../../context/sendInn/sendInnContext';
import SaveAndDeleteButtons from '../../button/navigation/save-and-delete/SaveAndDeleteButtons';
import LinkButton from '../../link-button/LinkButton';

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
      <nav>
        <div className="button-row">
          {nextLocation && (
            <LinkButton buttonVariant="primary" onClick={nextClickHandler} to={nextLocation}>
              <span aria-live="polite" className="navds-body-short font-bold">
                {translate(
                  isMellomlagringActive
                    ? TEXTS.grensesnitt.navigation.saveAndContinue
                    : TEXTS.grensesnitt.navigation.next,
                )}
              </span>
              <span className="navds-button__icon">
                <ArrowRightIcon aria-hidden />
              </span>
            </LinkButton>
          )}
          {prevLocation && (
            <LinkButton buttonVariant="secondary" onClick={prevClickHandler} to={prevLocation}>
              <span className="navds-button__icon">
                <ArrowLeftIcon aria-hidden />
              </span>
              <span aria-live="polite" className="navds-body-short font-bold">
                {translate(TEXTS.grensesnitt.navigation.previous)}
              </span>
            </LinkButton>
          )}
        </div>
        {isMellomlagringActive && <SaveAndDeleteButtons submission={submission} />}
        {!isMellomlagringActive && (
          <div className="button-row button-row__center">
            <Button variant="tertiary" onClick={onCancel}>
              {translate(TEXTS.grensesnitt.navigation.cancelAndDiscard)}
            </Button>
          </div>
        )}
      </nav>
    </>
  );
};

export default FormNavigation;
