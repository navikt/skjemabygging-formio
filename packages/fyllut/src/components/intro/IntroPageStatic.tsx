import { GuidePanel, Heading } from '@navikt/ds-react';
import { formUtils, LinkButton, useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useNavigate, useResolvedPath, useSearchParams } from 'react-router-dom';
import { IntroPageState, useIntroPage } from './IntroPageContext';

const IntroPageStatic = () => {
  const formUrl = useResolvedPath('').pathname;
  const { translate } = useLanguages();
  const [searchParams] = useSearchParams();
  const innsendingsIdFromUrl = searchParams.get('innsendingsId');
  const navigate = useNavigate();
  const [description, setDescription] = useState<string>();
  const [descriptionBold, setDescriptionBold] = useState<string>();
  const [saveDataBullet, setSaveDataBullet] = useState<string>();
  const [saveDataBulletBold, setSaveDataBulletBold] = useState<string>();
  const { form, state } = useIntroPage();

  const firstPanelSlug = formUtils.getPanelSlug(form, 0);
  const { baseUrl } = useAppConfig();

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

  const startUrl = `${formUrl}/${innsendingsIdFromUrl ? 'oppsummering' : firstPanelSlug}`;

  const navigateToFormPage = (event) => {
    event.preventDefault();
    if (state === IntroPageState.DIGITAL) {
      // important to reload page due to forced idporten login if sub=digital
      window.location.href = `${baseUrl}${startUrl}?${searchParams.toString()}`;
    } else {
      navigate(startUrl);
    }
  };

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

      <nav className="button-row button-row__center">
        <LinkButton buttonVariant="primary" to={`${baseUrl}${startUrl}`} onClick={navigateToFormPage}>
          {translate(TEXTS.grensesnitt.introPage.start)}
        </LinkButton>
        <button onClick={() => navigate(-1)} className="navds-button navds-button--tertiary">
          <span aria-live="polite" className="navds-body-short font-bold">
            {translate(TEXTS.grensesnitt.goBack)}
          </span>
        </button>
      </nav>
    </>
  );
};

export default IntroPageStatic;
