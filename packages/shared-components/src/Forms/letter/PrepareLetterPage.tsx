import { styled } from "@material-ui/styles";
import { Heading } from "@navikt/ds-react";
import { Enhet, NavFormType, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchEnhetsliste, isEnhetSupported } from "../../api/fetchEnhetsliste";
import ErrorPage from "../../components/ErrorPage";
import LoadingComponent from "../../components/LoadingComponent";
import { useAppConfig } from "../../configContext";
import { useLanguages } from "../../context/languages";
import { scrollToAndSetFocus } from "../../util/focus-management";
import { getVedleggsFelterSomSkalSendes } from "../../util/forsteside";
import NavigateButtonComponent from "../NavigateButtonComponent";
import LetterAddAttachment from "./LetterAddAttachment";
import LetterDownload from "./LetterDownload";
import LetterInTheMail from "./LetterInTheMail";
import LetterNextSteps from "./LetterNextSteps";
import LetterUXSignals from "./LetterUXSignals";

const compareEnheter = (enhetA, enhetB) => enhetA.navn.localeCompare(enhetB.navn, "nb");

interface Props {
  form: NavFormType;
  submission: any;
  formUrl?: string;
  translations: any;
}

export function PrepareLetterPage({ form, submission, formUrl, translations }: Props) {
  useEffect(() => scrollToAndSetFocus("main", "start"), []);
  const { fyllutBaseURL, baseUrl, logger } = useAppConfig();
  const { translate } = useLanguages();
  const { state } = useLocation();
  const [goBackUrl, setGoBackURL] = useState("");
  const [enhetsListe, setEnhetsListe] = useState<Enhet[]>([]);
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
          const filteredList = enhetsliste.filter(isEnhetSupported(enhetstyper!)).sort(compareEnheter);
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

  const attachments = getVedleggsFelterSomSkalSendes(submission.data, form);
  const hasAttachments = attachments.length > 0;

  return (
    <ResultContent>
      <Heading level="2" size="large" className="margin-bottom-double">
        {translate(TEXTS.statiske.prepareLetterPage.subTitle)}
      </Heading>
      <main className="fyllut-layout" id="maincontent" tabIndex={-1}>
        <section className="main-col">
          <LetterDownload
            index={1}
            form={form}
            submission={submission}
            enhetsListe={enhetsListe}
            fyllutBaseURL={fyllutBaseURL}
            translate={translate}
            translations={translations}
          />
          {hasAttachments && <LetterAddAttachment index={2} vedleggSomSkalSendes={attachments} translate={translate} />}
          <LetterInTheMail index={hasAttachments ? 3 : 2} vedleggSomSkalSendes={attachments} translate={translate} />
          <LetterNextSteps translate={translate} index={hasAttachments ? 4 : 3} />
          <NavigateButtonComponent translate={translate} goBackUrl={goBackUrl} />
          {
            // TODO: If the UXSignal pilot is successful, the study code should be a new setting on the form.
            skjemanummer === "NAV 08-09.06" && <LetterUXSignals code="study-dont9j6txe" />
          }
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
