import { GuidePanel, Heading } from '@navikt/ds-react';
import { useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import IntroPageButtonRow from './IntroPageButtonRow';
import { IntroPageState, useIntroPage } from './IntroPageContext';

const IntroPageStatic = () => {
  const { translate } = useLanguages();
  const [description, setDescription] = useState<string>();
  const [descriptionBold, setDescriptionBold] = useState<string>();
  const [saveDataBullet, setSaveDataBullet] = useState<string>();
  const [saveDataBulletBold, setSaveDataBulletBold] = useState<string>();
  const { state } = useIntroPage();

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
    } else if (state === IntroPageState.NONE) {
      setDescriptionBold(TEXTS.statiske.introPage.noSubmissionDescriptionBold);
      setDescription(TEXTS.statiske.introPage.noSubmissionDescription);
      setSaveDataBulletBold(TEXTS.statiske.introPage.notSaveBold);
      setSaveDataBullet(TEXTS.statiske.introPage.notSave);
    }
  }, [state]);

  if (!state) return;

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
