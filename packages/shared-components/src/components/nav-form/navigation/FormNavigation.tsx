import { ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';
import { To, useLocation } from 'react-router-dom';
import { useLanguages } from '../../../context/languages';
import { useSendInn } from '../../../context/sendInn/sendInnContext';
import SaveAndDeleteButtons from '../../button/navigation/save-and-delete/SaveAndDeleteButtons';
import LinkButton from '../../link-button/LinkButton';

export interface Props {
  formUrl: string;
  isValid: (currentPageOnly: boolean) => Promise<boolean>;
  submission?: Submission;
  onCancel: () => void;
  navigateTo: (to: To) => void;
  finalStep?: string;
  paths: {
    prev?: string;
    next?: string;
  };
}

const FormNavigation = ({ formUrl, paths, isValid, submission, onCancel, navigateTo, finalStep }: Props) => {
  const { isMellomlagringActive, updateMellomlagring } = useSendInn();
  const { search } = useLocation();
  const { translate } = useLanguages();

  const [nextLocation, setNextLocation] = useState<To | undefined>({
    pathname: `${formUrl}/${paths.next ?? finalStep}`,
    search,
  });
  const [prevLocation, setPrevLocation] = useState<To | undefined>(
    paths.prev ? { pathname: `${formUrl}/${paths.prev}`, search } : undefined,
  );

  useEffect(() => {
    setNextLocation({ pathname: `${formUrl}/${paths.next ?? finalStep}`, search });
  }, [search, paths.next, formUrl, finalStep]);

  useEffect(() => {
    setPrevLocation(paths.prev ? { pathname: `${formUrl}/${paths.prev}`, search } : undefined);
  }, [search, paths.prev, formUrl]);

  const nextClickHandler = useCallback(
    async (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      if (!nextLocation) {
        return false;
      }
      const isLastPanel = !paths.next;
      const valid = await isValid(!isLastPanel);
      if (!valid) {
        return false;
      }
      if (isMellomlagringActive && submission) {
        updateMellomlagring(submission).catch((_e) => {});
      }
      navigateTo(nextLocation);
      return true;
    },
    [isMellomlagringActive, isValid, navigateTo, nextLocation, paths.next, submission, updateMellomlagring],
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
