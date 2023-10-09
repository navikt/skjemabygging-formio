import { GuidePanel, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { NavFormType, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { Link, useHref, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import http from '../api/http';
import { useLanguages } from '../context/languages';
import { useAppConfig } from '../index';
import { getPanelSlug } from '../util/form';

export interface Props {
  form: NavFormType;
  formUrl: string;
}

const supportsPapirOgDigital = (form: NavFormType) => {
  const { innsending } = form.properties;
  return !innsending || innsending === 'PAPIR_OG_DIGITAL';
};

export function IntroPage({ form, formUrl }: Props) {
  const { translate } = useLanguages();
  const { search } = useLocation();
  const [searchParams] = useSearchParams();
  const innsendingsIdFromUrl = searchParams.get('innsendingsId');
  const navigate = useNavigate();
  const [description, setDescription] = useState<string>();
  const [descriptionBold, setDescriptionBold] = useState<string>();
  const { submissionMethod } = useAppConfig();
  const [mustSelectSubmissionMethod, setMustSelectSubmissionMethod] = useState<boolean>(
    !submissionMethod && supportsPapirOgDigital(form),
  );
  const [selectedSubmissionMethod, setSelectedSubmissionMethod] = useState<string | undefined>(submissionMethod);
  const firstPanelSlug = getPanelSlug(form, 0);
  const basePath = useHref('/');

  useEffect(() => {
    if (selectedSubmissionMethod) {
      if (selectedSubmissionMethod === http.SubmissionMethodType.PAPER) {
        setDescriptionBold(TEXTS.statiske.introPage.paperDescriptionBold);
        setDescription(TEXTS.statiske.introPage.paperDescription);
      } else {
        // No description when digital submission
        setDescriptionBold(undefined);
        setDescription(undefined);
      }
    } else {
      if (form.properties?.innsending === 'KUN_PAPIR') {
        setDescriptionBold(TEXTS.statiske.introPage.paperDescriptionBold);
        setDescription(TEXTS.statiske.introPage.paperDescription);
      } else if (form.properties?.innsending === 'PAPIR_OG_DIGITAL') {
        setDescriptionBold(TEXTS.statiske.introPage.paperAndDigitalDescriptionBold);
        setDescription(TEXTS.statiske.introPage.paperAndDigitalDescription);
      } else if (form.properties?.innsending === 'INGEN') {
        setDescriptionBold(TEXTS.statiske.introPage.noSubmissionDescriptionBold);
        setDescription(TEXTS.statiske.introPage.noSubmissionDescription);
      }
      // No description when form.properties.innsending === "KUN_DIGITAL"
    }
  }, [form.properties?.innsending, search, selectedSubmissionMethod]);

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
              <li className="mb-4">
                <b>{translate(TEXTS.statiske.introPage.notSaveBold)} </b>
                {translate(TEXTS.statiske.introPage.notSave)}
              </li>
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
            <Link
              className="navds-button navds-button--primary"
              to={{
                pathname: innsendingsIdFromUrl ? `${formUrl}/oppsummering` : `${formUrl}/${firstPanelSlug}`,
                search,
              }}
            >
              <span aria-live="polite" className="navds-body-short font-bold">
                {translate(TEXTS.grensesnitt.introPage.start)}
              </span>
            </Link>
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
