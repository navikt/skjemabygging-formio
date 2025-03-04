import { GuidePanel, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { NavFormType, submissionTypesUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useHref, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import http from '../../api/util/http/http';
import LinkButton from '../../components/link-button/LinkButton';
import { useLanguages } from '../../context/languages';
import { useAppConfig } from '../../index';
import { getPanelSlug } from '../../util/form/form';
export interface Props {
  form: NavFormType;
  formUrl: string;
}

const supportsPapirOgDigital = (form: NavFormType) => {
  const { submissionTypes } = form.properties;
  return (
    submissionTypesUtils.isDigitalSubmission(submissionTypes) && submissionTypesUtils.isPaperSubmission(submissionTypes)
  );
};

export function IntroPage({ form, formUrl }: Props) {
  const { translate } = useLanguages();
  const { search } = useLocation();
  const [searchParams] = useSearchParams();
  const innsendingsIdFromUrl = searchParams.get('innsendingsId');
  const navigate = useNavigate();
  const [description, setDescription] = useState<string>();
  const [descriptionBold, setDescriptionBold] = useState<string>();
  const [saveDataBullet, setSaveDataBullet] = useState<string>();
  const [saveDataBulletBold, setSaveDataBulletBold] = useState<string>();
  const { submissionMethod } = useAppConfig();
  const [mustSelectSubmissionMethod, setMustSelectSubmissionMethod] = useState<boolean>(
    !submissionMethod && supportsPapirOgDigital(form),
  );
  const [selectedSubmissionMethod, setSelectedSubmissionMethod] = useState<string | undefined>(submissionMethod);
  const firstPanelSlug = getPanelSlug(form, 0);
  const basePath = useHref('/');
  const { submissionTypes } = form.properties;

  useEffect(() => {
    if (selectedSubmissionMethod) {
      if (selectedSubmissionMethod === http.SubmissionMethodType.PAPER) {
        setDescriptionBold(TEXTS.statiske.introPage.paperDescriptionBold);
        setDescription(TEXTS.statiske.introPage.paperDescription);
        setSaveDataBulletBold(TEXTS.statiske.introPage.notSaveBold);
        setSaveDataBullet(TEXTS.statiske.introPage.notSave);
      } else {
        // No description when digital submission
        setDescriptionBold(undefined);
        setDescription(undefined);
        setSaveDataBulletBold(TEXTS.statiske.introPage.autoSaveBold);
        setSaveDataBullet(TEXTS.statiske.introPage.autoSave);
      }
    } else {
      if (submissionTypesUtils.isPaperSubmissionOnly(submissionTypes)) {
        setDescriptionBold(TEXTS.statiske.introPage.paperDescriptionBold);
        setDescription(TEXTS.statiske.introPage.paperDescription);
        setSaveDataBulletBold(TEXTS.statiske.introPage.notSaveBold);
        setSaveDataBullet(TEXTS.statiske.introPage.notSave);
      } else if (
        submissionTypesUtils.isPaperSubmission(submissionTypes) &&
        submissionTypesUtils.isDigitalSubmission(submissionTypes)
      ) {
        setDescriptionBold(TEXTS.statiske.introPage.paperAndDigitalDescriptionBold);
        setDescription(TEXTS.statiske.introPage.paperAndDigitalDescription);
        setSaveDataBulletBold(undefined);
        setSaveDataBullet(undefined);
      } else if (submissionTypesUtils.isNoneSubmission(submissionTypes)) {
        setDescriptionBold(TEXTS.statiske.introPage.noSubmissionDescriptionBold);
        setDescription(TEXTS.statiske.introPage.noSubmissionDescription);
        setSaveDataBulletBold(TEXTS.statiske.introPage.notSaveBold);
        setSaveDataBullet(TEXTS.statiske.introPage.notSave);
      } else {
        // No description when form.properties.innsending === "KUN_DIGITAL"
        setSaveDataBulletBold(TEXTS.statiske.introPage.autoSaveBold);
        setSaveDataBullet(TEXTS.statiske.introPage.autoSave);
      }
    }
  }, [submissionTypes, search, selectedSubmissionMethod]);

  useEffect(() => {
    setMustSelectSubmissionMethod(!submissionMethod && supportsPapirOgDigital(form));
  }, [submissionMethod, form]);

  const navigateToFormPage = (event) => {
    event.preventDefault();
    if (selectedSubmissionMethod) {
      searchParams.set('sub', selectedSubmissionMethod);
      // important to reload page due to forced idporten login if sub=digital
      window.location.href = `${basePath}${formUrl}/${firstPanelSlug}?${searchParams.toString()}`;
    }
  };

  return (
    <section className="fyllut-layout">
      <div className="main-col">
        {mustSelectSubmissionMethod && (
          <>
            <RadioGroup
              legend={translate(TEXTS.statiske.introPage.submissionMethod.legend)}
              name="submissionMethod"
              required={true}
              onChange={(sub: string) => setSelectedSubmissionMethod(sub)}
              className="mb-4"
            >
              <Radio value="digital">{translate(TEXTS.statiske.introPage.submissionMethod.digital)}</Radio>
              <Radio value="paper">{translate(TEXTS.statiske.introPage.submissionMethod.paper)}</Radio>
            </RadioGroup>
          </>
        )}

        {(selectedSubmissionMethod || !mustSelectSubmissionMethod) && (
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
        )}

        <nav className="button-row button-row__center">
          {mustSelectSubmissionMethod && selectedSubmissionMethod && (
            <a
              className="navds-button navds-button--primary navds-body-short font-bold"
              onClick={navigateToFormPage}
              href="#"
            >
              {translate(TEXTS.grensesnitt.introPage.start)}
            </a>
          )}
          {!mustSelectSubmissionMethod && (
            <LinkButton
              buttonVariant="primary"
              to={{
                pathname: innsendingsIdFromUrl ? `${formUrl}/oppsummering` : `${formUrl}/${firstPanelSlug}`,
                search,
              }}
            >
              <span aria-live="polite" className="navds-body-short font-bold">
                {translate(TEXTS.grensesnitt.introPage.start)}
              </span>
            </LinkButton>
          )}
          <button onClick={() => navigate(-1)} className="navds-button navds-button--tertiary">
            <span aria-live="polite" className="navds-body-short font-bold">
              {translate(TEXTS.grensesnitt.goBack)}
            </span>
          </button>
        </nav>
      </div>
    </section>
  );
}
