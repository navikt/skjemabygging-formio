import { GuidePanel, Heading } from '@navikt/ds-react';
import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import IntroPageButtonRow from './IntroPageButtonRow';
import { IntroPageState, useIntroPage } from './IntroPageContext';

const IntroPageStatic = () => {
  const { translate } = useLanguages();
  const { submissionMethod } = useAppConfig();
  const [description, setDescription] = useState<string>();
  const [descriptionBold, setDescriptionBold] = useState<string>();
  const [saveDataBullet, setSaveDataBullet] = useState<string>();
  const [saveDataBulletBold, setSaveDataBulletBold] = useState<string>();
  const { state } = useIntroPage();
  const { isMellomlagringReady, tokenDetails } = useSendInn();
  const { setTitle, setFormProgressVisible } = useForm();

  useEffect(() => {
    if (state === IntroPageState.PAPER) {
      setDescriptionBold(TEXTS.statiske.introPage.paperDescriptionBold);
      setDescription(TEXTS.statiske.introPage.paperDescription);
      setSaveDataBulletBold(TEXTS.statiske.introPage.notSaveBold);
      setSaveDataBullet(TEXTS.statiske.introPage.notSave);
    } else if (state === IntroPageState.DIGITAL) {
      // No description when digital submission
      setDescriptionBold(undefined);
      setDescription(undefined);
      setSaveDataBulletBold(TEXTS.statiske.introPage.autoSaveBold);
      setSaveDataBullet(TEXTS.statiske.introPage.autoSave);
    } else if (state === IntroPageState.DIGITAL_NO_LOGIN) {
      // No description when digital nologin submission
      setDescriptionBold(
        translate(TEXTS.statiske.introPage.nologinTimeLimitBold, {
          tokenExpirationTime: tokenDetails?.exp
            ? dateUtils.formatUnixEpochSecondsToLocalTime(tokenDetails?.exp)
            : 'XX.XX',
        }),
      );
      setDescription(TEXTS.statiske.introPage.nologinTimeLimit);
      setSaveDataBulletBold(TEXTS.statiske.introPage.notSaveBold);
      setSaveDataBullet(TEXTS.statiske.introPage.notSave);
    } else if (state === IntroPageState.NONE) {
      setDescriptionBold(TEXTS.statiske.introPage.noSubmissionDescriptionBold);
      setDescription(TEXTS.statiske.introPage.noSubmissionDescription);
      setSaveDataBulletBold(TEXTS.statiske.introPage.notSaveBold);
      setSaveDataBullet(TEXTS.statiske.introPage.notSave);
    }
  }, [state, tokenDetails, translate]);

  useEffect(() => {
    setTitle(TEXTS.grensesnitt.introPage.title);
    setFormProgressVisible(true);
  }, [setTitle, setFormProgressVisible]);

  if (!state || (submissionMethod === 'digital' && !isMellomlagringReady)) return;

  return (
    <>
      <GuidePanel poster className="mb intro-guide-panel">
        <Heading level="2" size="small" spacing>
          {translate(TEXTS.statiske.introPage.title)}
        </Heading>
        <ul>
          {description && (
            <li className="mb-4">
              <b>{translate(descriptionBold)} </b>
              {translate(description)}
            </li>
          )}
          <li className="mb-4">
            <b>{translate(TEXTS.statiske.introPage.requiredFieldsBold)} </b>
            {translate(TEXTS.statiske.introPage.requiredFields)}
          </li>
          {saveDataBullet && (
            <li className="mb-4">
              <b>{translate(saveDataBulletBold)} </b>
              {translate(saveDataBullet)}
            </li>
          )}
          <li>
            <b>{translate(TEXTS.statiske.introPage.publicComputerBold)} </b>
            {translate(TEXTS.statiske.introPage.publicComputer)}
          </li>
        </ul>
      </GuidePanel>

      <IntroPageButtonRow />
    </>
  );
};

export default IntroPageStatic;
