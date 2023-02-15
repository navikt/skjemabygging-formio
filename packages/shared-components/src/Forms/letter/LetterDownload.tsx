import { Button } from "@navikt/ds-react";
import { Enhet, NavFormType, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Normaltekst, Systemtittel } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { fetchMottaksadresser } from "../../api/fetchMottaksadresser";
import AlertStripeHttpError from "../../components/error/AlertStripeHttpError";
import { useAppConfig } from "../../configContext";
import { useAmplitude } from "../../context/amplitude";
import { useLanguages } from "../../context/languages";
import { genererFoerstesideData } from "../../util/forsteside";
import { lastNedFilBase64 } from "../../util/pdf";
import DownloadPdfButton from "../components/DownloadPdfButton";
import EnhetSelector from "../components/EnhetSelector";

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
        // @ts-ignore
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

interface Props {
  index: number;
  form: NavFormType;
  submission: any;
  enhetsListe: Enhet[];
  fyllutBaseURL?: string;
  translate: any;
  translations: any;
}

const LetterDownload = ({ form, index, submission, enhetsListe, fyllutBaseURL, translate, translations }: Props) => {
  const [selectedEnhetNummer, setSelectedEnhetNummer] = useState<string | null>(null);
  const [isRequiredEnhetMissing, setIsRequiredEnhetMissing] = useState(false);
  const [hasDownloadedFoersteside, setHasDownloadedFoersteside] = useState(false);
  const [foerstesideError, setFoerstesideError] = useState(undefined);
  const [foerstesideLoading, setFoerstesideLoading] = useState(false);
  const [hasDownloadedPDF, setHasDownloadedPDF] = useState(false);
  const { loggSkjemaFullfort, loggSkjemaInnsendingFeilet } = useAmplitude();
  const { currentLanguage } = useLanguages();
  const { featureToggles } = useAppConfig();

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
          loading={foerstesideLoading}
        >
          {translate(TEXTS.grensesnitt.prepareLetterPage.downloadCoverPage)}
        </Button>
      </div>
      {foerstesideError && <AlertStripeHttpError error={foerstesideError} />}
      <DownloadPdfButton
        form={form}
        submission={submission}
        actionUrl={
          featureToggles?.enableExstreamPdf ? `${fyllutBaseURL}/api/pdf/convert` : `${fyllutBaseURL}/api/pdf-form-papir`
        }
        label={translate(form.properties.downloadPdfButtonText || TEXTS.grensesnitt.downloadApplication)}
        onClick={() => setHasDownloadedPDF(true)}
        translations={translations}
      />
    </section>
  );
};

export default LetterDownload;
