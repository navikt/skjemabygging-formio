import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { styled } from "@material-ui/styles";
import { Normaltekst, Sidetittel, Systemtittel } from "nav-frontend-typografi";
import { scrollToAndSetFocus } from "../util/focus-management";
import PropTypes from "prop-types";
import { useAmplitude } from "../context/amplitude";
import { genererFoerstesideData, getVedleggsFelterSomSkalSendes } from "../util/forsteside";
import { lastNedFilBase64 } from "../util/pdf";
import { AppConfigContext } from "../configContext";
import TEXTS from "../texts";
import { useTranslations } from "../context/i18n";

const LeggTilVedleggSection = ({ index, vedleggSomSkalSendes, translate }) => {
  const skalSendeFlereVedlegg = vedleggSomSkalSendes.length > 1;
  return (
    <section
      className="wizard-page"
      aria-label={translate(TEXTS.prepareLetterPage.attachmentSectionTitle(index, skalSendeFlereVedlegg))}
    >
      <Systemtittel className="margin-bottom-default">
        {translate(TEXTS.prepareLetterPage.attachmentSectionTitle(index, skalSendeFlereVedlegg))}
      </Systemtittel>
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
    <section className="wizard-page" aria-label={translate(TEXTS.prepareLetterPage.firstSectionTitle(index))}>
      <Systemtittel className="margin-bottom-default">
        {translate(TEXTS.prepareLetterPage.firstSectionTitle(index))}
      </Systemtittel>
      <Normaltekst className="margin-bottom-default">{translate(TEXTS.prepareLetterPage.firstDescription)}</Normaltekst>
      <div className="margin-bottom-default">
        <button
          className="knapp knapp--fullbredde"
          onClick={() => {
            lastNedFoersteside(form, submission, fyllutBaseURL)
              .then(() => setHasDownloadedFoersteside(true))
              .catch(() => loggSkjemaInnsendingFeilet());
          }}
        >
          {translate(TEXTS.prepareLetterPage.downloadCoverPage)}
        </button>
      </div>
      <form
        id={form.path}
        action={`${fyllutBaseURL}/pdf-form-papir`}
        method="post"
        acceptCharset="utf-8"
        target="_blank"
        hidden
      >
        <textarea hidden={true} name="submission" readOnly={true} required value={JSON.stringify(submission)} />
        <textarea hidden={true} name="form" readOnly={true} required value={JSON.stringify(form)} />
      </form>
      <div>
        <input
          form={form.path}
          className="knapp knapp--fullbredde"
          onClick={() => setHasDownloadedPDF(true)}
          type="submit"
          value={translate(TEXTS.downloadApplication)}
        />
      </div>
    </section>
  );
};

const SendSoknadIPostenSection = ({ index, vedleggSomSkalSendes, translate }) => (
  <section className="wizard-page" aria-label={translate(TEXTS.prepareLetterPage.sendInPapirSectionTitle(index))}>
    <Systemtittel className="margin-bottom-default">
      {translate(TEXTS.prepareLetterPage.sendInPapirSectionTitle(index))}
    </Systemtittel>
    <Normaltekst className="margin-bottom-default">
      {translate(TEXTS.prepareLetterPage.SendInPapirSectionInstruction)}
      {vedleggSomSkalSendes.length > 0 &&
        translate(TEXTS.prepareLetterPage.sendInPapirAttachment(vedleggSomSkalSendes))}
    </Normaltekst>
  </section>
);

const HvaSkjerVidereSection = ({ index, translate }) => (
  <section className="wizard-page" aria-label={translate(TEXTS.prepareLetterPage.lastSectionTitle(index))}>
    <Systemtittel className="margin-bottom-default">
      {translate(TEXTS.prepareLetterPage.lastSectionTitle(index))}
    </Systemtittel>
    <Normaltekst className="margin-bottom-default">{translate(TEXTS.prepareLetterPage.lastSectionContent)}</Normaltekst>
  </section>
);

export function PrepareLetterPage({ form, submission, formUrl }) {
  useEffect(() => scrollToAndSetFocus("main", "start"), []);
  const { fyllutBaseURL } = useContext(AppConfigContext);
  const { translate } = useTranslations();
  const { state } = useLocation();
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
          <Link className="knapp knapp--fullbredde" to={goBackUrl}>
            {translate(TEXTS.goBack)}
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
