import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { styled } from "@material-ui/styles";
import { Normaltekst, Sidetittel, Systemtittel } from "nav-frontend-typografi";
import { scrollToAndSetFocus } from "../util/focus-management";
import PropTypes from "prop-types";
import { useAmplitude } from "../context/amplitude";
import { genererFoerstesideData, getVedleggsFelterSomSkalSendes } from "../util/forsteside";
import { lastNedFilBase64 } from "../util/pdf";
import { useAppConfig } from "../configContext";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { useLanguages } from "../context/languages";
import DownloadPdfButton from "./DownloadPdfButton";

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

function lastNedFoersteside(form, submission, fyllutBaseURL) {
  return fetch(`${fyllutBaseURL}/foersteside`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(genererFoerstesideData(form, submission.data)),
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

const LastNedSoknadSection = ({ form, index, submission, fyllutBaseURL, translate }) => {
  const [hasDownloadedFoersteside, setHasDownloadedFoersteside] = useState(false);
  const [hasDownloadedPDF, setHasDownloadedPDF] = useState(false);
  const { loggSkjemaFullfort, loggSkjemaInnsendingFeilet } = useAmplitude();

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
      <div className="margin-bottom-default">
        <button
          className="knapp knapp--fullbredde"
          onClick={() => {
            lastNedFoersteside(form, submission, fyllutBaseURL)
              .then(() => setHasDownloadedFoersteside(true))
              .catch(() => loggSkjemaInnsendingFeilet());
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
        label={translate(TEXTS.grensesnitt.downloadApplication)}
        onClick={() => setHasDownloadedPDF(true)}
        classNames="knapp knapp--fullbredde"
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

export function PrepareLetterPage({ form, submission, formUrl }) {
  useEffect(() => scrollToAndSetFocus("main", "start"), []);
  const { fyllutBaseURL } = useAppConfig();
  const { translate } = useLanguages();
  const { state, search } = useLocation();
  const [goBackUrl, setGoBackURL] = useState("");

  useEffect(() => {
    if (!state) setGoBackURL(`${formUrl}/oppsummering`);
    else setGoBackURL(state.previousPage);
  }, [state, formUrl]);

  const sections = [];
  const vedleggSomSkalSendes = getVedleggsFelterSomSkalSendes(submission.data, form);
  sections.push(
    <LastNedSoknadSection
      key="last-ned-soknad"
      form={form}
      submission={submission}
      fyllutBaseURL={fyllutBaseURL}
      translate={translate}
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
