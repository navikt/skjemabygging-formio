import { GuidePanel, Heading } from '@navikt/ds-react';
import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import IntroPageButtonRow from './IntroPageButtonRow';
import { IntroPageState, useIntroPage } from './IntroPageContext';

const IntroPageStatic = () => {
  const { translate } = useLanguages();
  const { submissionMethod } = useAppConfig();
  const { state } = useIntroPage();
  const { isMellomlagringReady, tokenDetails } = useSendInn();
  const { setTitle, setFormProgressVisible } = useForm();

  const introContent = useMemo(() => {
    if (state === IntroPageState.PAPER) {
      return {
        descriptionBold: TEXTS.statiske.introPage.paperDescriptionBold,
        description: TEXTS.statiske.introPage.paperDescription,
        saveDataBulletBold: TEXTS.statiske.introPage.notSaveBold,
        saveDataBullet: TEXTS.statiske.introPage.notSave,
      };
    }
    if (state === IntroPageState.DIGITAL) {
      return {
        descriptionBold: undefined,
        description: undefined,
        saveDataBulletBold: TEXTS.statiske.introPage.autoSaveBold,
        saveDataBullet: TEXTS.statiske.introPage.autoSave,
      };
    }
    if (state === IntroPageState.DIGITAL_NO_LOGIN) {
      return {
        descriptionBold: translate(TEXTS.statiske.introPage.nologinTimeLimitBold, {
          tokenExpirationTime: tokenDetails?.exp
            ? dateUtils.formatUnixEpochSecondsToLocalTime(tokenDetails?.exp)
            : 'XX.XX',
        }),
        description: TEXTS.statiske.introPage.nologinTimeLimit,
        saveDataBulletBold: TEXTS.statiske.introPage.notSaveBold,
        saveDataBullet: TEXTS.statiske.introPage.notSave,
      };
    }
    if (state === IntroPageState.NONE) {
      return {
        descriptionBold: TEXTS.statiske.introPage.noSubmissionDescriptionBold,
        description: TEXTS.statiske.introPage.noSubmissionDescription,
        saveDataBulletBold: TEXTS.statiske.introPage.notSaveBold,
        saveDataBullet: TEXTS.statiske.introPage.notSave,
      };
    }
    return {
      descriptionBold: undefined,
      description: undefined,
      saveDataBulletBold: undefined,
      saveDataBullet: undefined,
    };
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
          {introContent.description && (
            <li className="mb-4">
              <b>{translate(introContent.descriptionBold)} </b>
              {translate(introContent.description)}
            </li>
          )}
          <li className="mb-4">
            <b>{translate(TEXTS.statiske.introPage.requiredFieldsBold)} </b>
            {translate(TEXTS.statiske.introPage.requiredFields)}
          </li>
          {introContent.saveDataBullet && (
            <li className="mb-4">
              <b>{translate(introContent.saveDataBulletBold)} </b>
              {translate(introContent.saveDataBullet)}
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
