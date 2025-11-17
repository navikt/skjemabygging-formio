import { GuidePanel, Heading } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
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
  const { isMellomlagringReady } = useSendInn();
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
      setDescriptionBold(undefined);
      setDescription(undefined);
      setSaveDataBulletBold(TEXTS.statiske.introPage.notSaveBold);
      setSaveDataBullet(TEXTS.statiske.introPage.notSave);
    } else if (state === IntroPageState.NONE) {
      setDescriptionBold(TEXTS.statiske.introPage.noSubmissionDescriptionBold);
      setDescription(TEXTS.statiske.introPage.noSubmissionDescription);
      setSaveDataBulletBold(TEXTS.statiske.introPage.notSaveBold);
      setSaveDataBullet(TEXTS.statiske.introPage.notSave);
    }
  }, [state]);

  useEffect(() => {
    setTitle(TEXTS.grensesnitt.introPage.title);
    setFormProgressVisible(true);
  }, [setTitle, setFormProgressVisible]);

  if (!state || (submissionMethod === 'digital' && !isMellomlagringReady)) return;

  return (
    <>
      <GuidePanel poster className="mb">
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
          <li className="mb-4">
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
