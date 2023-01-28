import { styled } from "@material-ui/styles";
import { Button } from "@navikt/ds-react";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Innholdstittel, Normaltekst, Systemtittel } from "nav-frontend-typografi";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchEnhetsliste, isEnhetSupported } from "../api/fetchEnhetsliste";
import { fetchMottaksadresser } from "../api/fetchMottaksadresser";
import AlertStripeHttpError from "../components/error/AlertStripeHttpError";
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
import NavigateButtonComponent from "./NavigateButtonComponent";

const LeggTilVedleggSection = ({ index, vedleggSomSkalSendes, translate }) => {
  const skalSendeFlereVedlegg = vedleggSomSkalSendes.length > 1;
  const attachmentSectionTitle = translate(TEXTS.statiske.prepareLetterPage.attachmentSectionTitleAttachTo)
    .concat(" ")
    .concat(
      skalSendeFlereVedlegg
        ? translate(TEXTS.statiske.prepareLetterPage.attachmentSectionTitleTheseAttachments)
        : translate(TEXTS.statiske.prepareLetterPage.attachmentSectionTitleThisAttachment)
    );
  return (
    <section className="wizard-page" aria-label={`${index}. ${attachmentSectionTitle}`}>
      <Systemtittel tag="h3" className="margin-bottom-small">{`${index}. ${attachmentSectionTitle}`}</Systemtittel>
      <ul>
        {vedleggSomSkalSendes.map((vedlegg) => (
          <li key={vedlegg.key}>{translate(vedlegg.label)}</li>
        ))}
      </ul>
    </section>
  );
};

async function lastNedFoersteside(form, submission, fyllutBaseURL, language, enhetNummer) {
  const mottaksadresser = enhetNummer ? [] : await fetchMottaksadresser(fyllutBaseURL);
  const body = genererFoerstesideData(form, submission.data, language, mottaksadresser, enhetNummer);
  return fetch(`${fyllutBaseURL}/api/foersteside`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then(async (response) => {
      if (response.ok) {
        return response;
      } else {
        const errorResponse = await response.json();
        const error = new Error(errorResponse.message);
        error.correlationId = errorResponse.correlation_id;
        throw error;
      }
    })
    .then((response) => response.json())
    .then((json) => json.foersteside)
    .then((base64EncodedPdf) => {
      lastNedFilBase64(base64EncodedPdf, "Førstesideark", "pdf");
    });
}

const LastNedSoknadSection = ({ form, index, submission, enhetsListe, fyllutBaseURL, translate, translations }) => {
  const [selectedEnhetNummer, setSelectedEnhetNummer] = useState(undefined);
  const [isRequiredEnhetMissing, setIsRequiredEnhetMissing] = useState(false);
  const [hasDownloadedFoersteside, setHasDownloadedFoersteside] = useState(false);
  const [foerstesideError, setFoerstesideError] = useState(undefined);
  const [foerstesideLoading, setFoerstesideLoading] = useState(false);
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
      <Systemtittel tag="h3" className="margin-bottom-small">
        {`${index}. ${translate(TEXTS.statiske.prepareLetterPage.firstSectionTitle)}`}
      </Systemtittel>
      <Normaltekst className="margin-bottom-default">
        {translate(TEXTS.statiske.prepareLetterPage.firstDescription)}
      </Normaltekst>
      <EnhetSelector
        enhetsliste={enhetsListe}
        onSelectEnhet={(enhetNummer) => {
          setSelectedEnhetNummer(enhetNummer);
          setIsRequiredEnhetMissing(false);
        }}
        error={isRequiredEnhetMissing ? translate(TEXTS.statiske.prepareLetterPage.entityNotSelectedError) : undefined}
      />
      <div className="margin-bottom-default">
        <Button
          onClick={() => {
            if (form.properties.enhetMaVelgesVedPapirInnsending && !selectedEnhetNummer) {
              setIsRequiredEnhetMissing(true);
            } else {
              setFoerstesideError(undefined);
              setFoerstesideLoading(true);
              lastNedFoersteside(form, submission, fyllutBaseURL, currentLanguage, selectedEnhetNummer)
                .then(() => setHasDownloadedFoersteside(true))
                .catch((error) => {
                  loggSkjemaInnsendingFeilet();
                  setFoerstesideError(error);
                })
                .finally(() => setFoerstesideLoading(false));
            }
          }}
          type="standard"
          loading={foerstesideLoading}
        >
          {translate(TEXTS.grensesnitt.prepareLetterPage.downloadCoverPage)}
        </Button>
      </div>
      {foerstesideError && <AlertStripeHttpError error={foerstesideError} />}
      <DownloadPdfButton
        form={form}
        submission={submission}
        actionUrl={`${fyllutBaseURL}/api/pdf/convert`}
        label={translate(form.properties.downloadPdfButtonText || TEXTS.grensesnitt.downloadApplication)}
        onClick={() => setHasDownloadedPDF(true)}
        translations={translations}
        submissionMethod="paper"
      />
    </section>
  );
};

const SendSoknadIPostenSection = ({ index, vedleggSomSkalSendes, translate }) => (
  <section
    className="wizard-page"
    aria-label={`${index}. ${translate(TEXTS.statiske.prepareLetterPage.sendInPapirSectionTitle)}`}
  >
    <Systemtittel tag="h3" className="margin-bottom-small">
      {`${index}. ${translate(TEXTS.statiske.prepareLetterPage.sendInPapirSectionTitle)}`}
    </Systemtittel>
    <Normaltekst className="margin-bottom-default">
      {translate(TEXTS.statiske.prepareLetterPage.SendInPapirSectionInstruction)}
      {vedleggSomSkalSendes.length > 0 &&
        " ".concat(
          translate(TEXTS.statiske.prepareLetterPage.sendInPapirSectionAttachTo)
            .concat(" ")
            .concat(
              vedleggSomSkalSendes.length > 1
                ? translate(TEXTS.statiske.prepareLetterPage.sendInPapirSectionAttachments)
                : translate(TEXTS.statiske.prepareLetterPage.sendInPapirSectionAttachment)
            )
            .concat(" ")
            .concat(translate(TEXTS.statiske.prepareLetterPage.sendInPapirSection))
        )}
    </Normaltekst>
  </section>
);

const HvaSkjerVidereSection = ({ index, translate }) => (
  <section
    className="wizard-page"
    aria-label={`${index}. ${translate(TEXTS.statiske.prepareLetterPage.lastSectionTitle)}`}
  >
    <Systemtittel tag="h3" className="margin-bottom-small">
      {`${index}. ${translate(TEXTS.statiske.prepareLetterPage.lastSectionTitle)}`}
    </Systemtittel>
    <Normaltekst className="margin-bottom-default">
      {translate(TEXTS.statiske.prepareLetterPage.lastSectionContent)}
    </Normaltekst>
  </section>
);

const compareEnheter = (enhetA, enhetB) => enhetA.navn.localeCompare(enhetB.navn, "nb");

export function PrepareLetterPage({ form, submission, formUrl, translations }) {
  useEffect(() => scrollToAndSetFocus("main", "start"), []);
  const { fyllutBaseURL, baseUrl, logger } = useAppConfig();
  const { translate } = useLanguages();
  const { state } = useLocation();
  const [goBackUrl, setGoBackURL] = useState("");
  const [enhetsListe, setEnhetsListe] = useState(undefined);
  const [enhetsListeError, setEnhetsListeError] = useState(false);
  const [enhetslisteFilteringError, setEnhetslisteFilteringError] = useState(false);

  useEffect(() => {
    if (!state) setGoBackURL(`${formUrl}/oppsummering`);
    else setGoBackURL(state.previousPage);
  }, [state, formUrl]);

  const { enhetMaVelgesVedPapirInnsending, enhetstyper, skjemanummer } = form.properties;

  useEffect(() => {
    if (enhetMaVelgesVedPapirInnsending) {
      fetchEnhetsliste(baseUrl)
        .then((enhetsliste) => {
          const filteredList = enhetsliste.filter(isEnhetSupported(enhetstyper)).sort(compareEnheter);
          if (filteredList.length === 0) {
            setEnhetslisteFilteringError(true);
            return enhetsliste.sort(compareEnheter);
          }
          return filteredList;
        })
        .then(setEnhetsListe)
        .catch(() => setEnhetsListeError(true));
    }
  }, [baseUrl, enhetMaVelgesVedPapirInnsending, enhetstyper]);

  useEffect(() => {
    if (logger && enhetslisteFilteringError) {
      logger.error("Ingen relevante enheter funnet", { skjemanummer, enhetstyper });
    }
  }, [enhetslisteFilteringError, enhetstyper, logger, skjemanummer]);

  if (enhetMaVelgesVedPapirInnsending && enhetsListeError) {
    return <ErrorPage errorMessage={translate(TEXTS.statiske.prepareLetterPage.entityFetchError)} />;
  }

  if (enhetMaVelgesVedPapirInnsending && enhetsListe === undefined) {
    return <LoadingComponent />;
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
      <Innholdstittel tag="h2" className="margin-bottom-double">
        {translate(TEXTS.statiske.prepareLetterPage.subTitle)}
      </Innholdstittel>
      <main className="fyllut-layout" id="maincontent" tabIndex={-1}>
        <section className="main-col">
          {sections.map((section, index) => React.cloneElement(section, { index: index + 1 }))}
          <NavigateButtonComponent translate={translate} goBackUrl={goBackUrl} secondaryOnly={true} />
        </section>
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
  "& section.wizard-page": {
    paddingBottom: "3.75rem",
  },
});
