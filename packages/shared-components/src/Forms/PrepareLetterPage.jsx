import { styled } from "@material-ui/styles";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Normaltekst, Sidetittel, Systemtittel } from "nav-frontend-typografi";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchEnhetsListe, skalHaKontaktInfo, skalVisesPaaNav } from "../api/fetchEnhetsliste";
import ErrorPage from "../components/ErrorPage";
import LoadingComponent from "../components/LoadingComponent";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../context/languages";
import { scrollToAndSetFocus } from "../util/focus-management";
import { genererFoerstesideData, getVedleggsFelterSomSkalSendes } from "../util/forsteside";
import { lastNedFilBase64 } from "../util/pdf";
import DownloadPdfButton from "./components/DownloadPdfButton";
import EnhetSelector from "./components/EnhetSelector";

const LeggTilVedleggSection = ({ index, vedleggSomSkalSendes, translate }) => {
  const skalSendeFlereVedlegg = vedleggSomSkalSendes.length > 1;
  const attachmentSectionTitle = translate(
    TEXTS.statiske.prepareLetterPage.attachmentSectionTitleAttachTo
      .concat(" ")
      .concat(
        skalSendeFlereVedlegg
          ? TEXTS.statiske.prepareLetterPage.attachmentSectionTitleTheseAttachments
          : TEXTS.statiske.prepareLetterPage.attachmentSectionTitleThisAttachment
      )
  );
  return (
    <section className="wizard-page" aria-label={`${index}.${attachmentSectionTitle}`}>
      <Systemtittel className="margin-bottom-default">{`${index}.${attachmentSectionTitle}`}</Systemtittel>
      <ul>
        {vedleggSomSkalSendes.map((vedlegg) => (
          <li key={vedlegg.key}>{translate(vedlegg.label)}</li>
        ))}
      </ul>
    </section>
  );
};

async function lastNedFoersteside(form, submission, fyllutBaseURL, language, enhet) {
  const mottaksadresser = enhet
    ? []
    : await fetch(`${fyllutBaseURL}/mottaksadresser`).then((response) => {
        if (response.ok) {
          return response.json();
        }
        return [];
      });
  const body = genererFoerstesideData(form, submission.data, language, mottaksadresser, enhet);
  return fetch(`${fyllutBaseURL}/foersteside`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then((response) => {
      if (response.ok) {
        return response;
      } else {
        throw new Error("Failed to retrieve foersteside from soknadsveiviser " + JSON.stringify(response.body));
      }
    })
    .then((response) => response.json())
    .then((json) => json.foersteside)
    .then((base64EncodedPdf) => {
      lastNedFilBase64(base64EncodedPdf, "Førstesideark", "pdf");
    })
    .catch((e) => console.log("Failed to download foersteside", e));
}

const LastNedSoknadSection = ({ form, index, submission, enhetsListe, fyllutBaseURL, translate, translations }) => {
  const [selectedEnhet, setSelectedEnhet] = useState(undefined);
  const [isRequiredEnhetMissing, setIsRequiredEnhetMissing] = useState(false);
  const [hasDownloadedFoersteside, setHasDownloadedFoersteside] = useState(false);
  const [hasDownloadedPDF, setHasDownloadedPDF] = useState(false);
  const { loggSkjemaFullfort, loggSkjemaInnsendingFeilet } = useAmplitude();
  const { currentLanguage } = useLanguages();

  useEffect(() => {
    if (hasDownloadedFoersteside && hasDownloadedPDF) {
      loggSkjemaFullfort("papirinnsending");
    }
  }, [hasDownloadedFoersteside, hasDownloadedPDF, loggSkjemaFullfort]);

  return (
    <section
      className="wizard-page"
      aria-label={`${index}. ${translate(TEXTS.statiske.prepareLetterPage.firstSectionTitle)}`}
    >
      <Systemtittel className="margin-bottom-default">
        {`${index}. ${translate(TEXTS.statiske.prepareLetterPage.firstSectionTitle)}`}
      </Systemtittel>
      <Normaltekst className="margin-bottom-default">
        {translate(TEXTS.statiske.prepareLetterPage.firstDescription)}
      </Normaltekst>
      <EnhetSelector
        enhetsListe={enhetsListe}
        onSelectEnhet={(enhet) => {
          setSelectedEnhet(enhet);
          setIsRequiredEnhetMissing(false);
        }}
        error={isRequiredEnhetMissing ? translate(TEXTS.statiske.prepareLetterPage.entityNotSelectedError) : undefined}
      />
      <div className="margin-bottom-default">
        <button
          className="knapp knapp--fullbredde"
          onClick={() => {
            if (form.properties.enhetMaVelgesVedPapirInnsending && !selectedEnhet) {
              setIsRequiredEnhetMissing(true);
            } else {
              lastNedFoersteside(form, submission, fyllutBaseURL, currentLanguage, selectedEnhet)
                .then(() => setHasDownloadedFoersteside(true))
                .catch(() => loggSkjemaInnsendingFeilet());
            }
          }}
          type="button"
        >
          {translate(TEXTS.grensesnitt.prepareLetterPage.downloadCoverPage)}
        </button>
      </div>
      <DownloadPdfButton
        form={form}
        submission={submission}
        actionUrl={`${fyllutBaseURL}/pdf-form-papir`}
        label={translate(form.properties.downloadPdfButtonText || TEXTS.grensesnitt.downloadApplication)}
        onClick={() => setHasDownloadedPDF(true)}
        classNames="knapp knapp--fullbredde"
        translations={translations}
      />
    </section>
  );
};

const SendSoknadIPostenSection = ({ index, vedleggSomSkalSendes, translate }) => (
  <section
    className="wizard-page"
    aria-label={`${index}. ${translate(TEXTS.statiske.prepareLetterPage.sendInPapirSectionTitle)}`}
  >
    <Systemtittel className="margin-bottom-default">
      {`${index}. ${translate(TEXTS.statiske.prepareLetterPage.sendInPapirSectionTitle)}`}
    </Systemtittel>
    <Normaltekst className="margin-bottom-default">
      {translate(TEXTS.statiske.prepareLetterPage.SendInPapirSectionInstruction)}
      {vedleggSomSkalSendes.length > 0 &&
        translate(
          TEXTS.statiske.prepareLetterPage.sendInPapirSectionAttachTo
            .concat(" ")
            .concat(
              vedleggSomSkalSendes.length > 1
                ? TEXTS.statiske.prepareLetterPage.sendInPapirSectionAttachments
                : TEXTS.statiske.prepareLetterPage.sendInPapirSectionAttachment
            )
            .concat(" ")
            .concat(TEXTS.statiske.prepareLetterPage.sendInPapirSection)
        )}
    </Normaltekst>
  </section>
);

const HvaSkjerVidereSection = ({ index, translate }) => (
  <section
    className="wizard-page"
    aria-label={`${index}. ${translate(TEXTS.statiske.prepareLetterPage.lastSectionTitle)}`}
  >
    <Systemtittel className="margin-bottom-default">
      {`${index}. ${translate(TEXTS.statiske.prepareLetterPage.lastSectionTitle)}`}
    </Systemtittel>
    <Normaltekst className="margin-bottom-default">
      {translate(TEXTS.statiske.prepareLetterPage.lastSectionContent)}
    </Normaltekst>
  </section>
);

export function PrepareLetterPage({ form, submission, formUrl, translations }) {
  useEffect(() => scrollToAndSetFocus("main", "start"), []);
  const { fyllutBaseURL, baseUrl } = useAppConfig();
  const { translate } = useLanguages();
  const { state, search } = useLocation();
  const [goBackUrl, setGoBackURL] = useState("");
  const [enhetsListe, setEnhetsListe] = useState(undefined);

  useEffect(() => {
    if (!state) setGoBackURL(`${formUrl}/oppsummering`);
    else setGoBackURL(state.previousPage);
  }, [state, formUrl]);

  const { enhetMaVelgesVedPapirInnsending } = form.properties;
  useEffect(() => {
    if (enhetMaVelgesVedPapirInnsending) {
      fetchEnhetsListe(baseUrl)
        .then((enhetsListe) =>
          enhetsListe
            .filter(skalHaKontaktInfo)
            .filter(skalVisesPaaNav)
            .sort((enhetA, enhetB) => enhetA.enhet.navn.localeCompare(enhetB.enhet.navn, "nb"))
        )
        .then(setEnhetsListe);
    }
  }, [baseUrl, enhetMaVelgesVedPapirInnsending]);

  if (enhetMaVelgesVedPapirInnsending && enhetsListe === undefined) {
    return <LoadingComponent />;
  }

  if (enhetMaVelgesVedPapirInnsending && enhetsListe.length === 0) {
    return <ErrorPage errorMessage={translate(TEXTS.statiske.prepareLetterPage.entityFetchError)} />;
  }

  const sections = [];
  const vedleggSomSkalSendes = getVedleggsFelterSomSkalSendes(submission.data, form);
  sections.push(
    <LastNedSoknadSection
      key="last-ned-soknad"
      form={form}
      submission={submission}
      enhetsListe={enhetsListe}
      fyllutBaseURL={fyllutBaseURL}
      translate={translate}
      translations={translations}
    />
  );
  if (vedleggSomSkalSendes.length > 0) {
    sections.push(
      <LeggTilVedleggSection
        key="vedlegg-som-skal-sendes"
        vedleggSomSkalSendes={vedleggSomSkalSendes}
        translate={translate}
      />
    );
  }
  sections.push(
    <SendSoknadIPostenSection
      key="send-soknad-i-posten"
      vedleggSomSkalSendes={vedleggSomSkalSendes}
      translate={translate}
    />
  );
  sections.push(<HvaSkjerVidereSection key="hva-skjer-videre" translate={translate} />);
  return (
    <ResultContent>
      <Sidetittel className="margin-bottom-large">{translate(form.title)}</Sidetittel>
      <main id="maincontent" tabIndex={-1}>
        {sections.map((section, index) => React.cloneElement(section, { index: index + 1 }))}
        <div>
          <Link className="knapp knapp--fullbredde" to={{ pathname: goBackUrl, search }}>
            {translate(TEXTS.grensesnitt.goBack)}
          </Link>
        </div>
      </main>
    </ResultContent>
  );
}

PrepareLetterPage.propTypes = {
  form: PropTypes.object.isRequired,
  submission: PropTypes.object.isRequired,
};

const ResultContent = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
});
