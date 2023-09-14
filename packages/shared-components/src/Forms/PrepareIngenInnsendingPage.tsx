import { BodyShort, Heading } from "@navikt/ds-react";
import { Submission, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { useEffect } from "react";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../context/languages";
import { scrollToAndSetFocus } from "../util/focus-management";
import makeStyles from "../util/jss";
import NavigateButtonComponent from "./NavigateButtonComponent";
import DownloadPdfButton from "./components/DownloadPdfButton";

export interface Props {
  form: any;
  submission: Submission;
  translations: { [key: string]: string } | {};
  formUrl: string;
}

const useStyles = makeStyles({
  content: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
});

export function PrepareIngenInnsendingPage({ form, submission, translations, formUrl }: Props) {
  useEffect(() => scrollToAndSetFocus("main", "start"), []);
  const { fyllutBaseURL } = useAppConfig();
  const { translate } = useLanguages();
  const { loggSkjemaFullfort } = useAmplitude();
  const styles = useStyles();

  return (
    <div className={styles.content}>
      <section id="maincontent" className="fyllut-layout" tabIndex={-1}>
        <section className="main-col" aria-label={translate(form.properties.innsendingOverskrift)}>
          <div className="wizard-page">
            <Heading level="3" size="medium" spacing>
              {translate(form.properties.innsendingOverskrift)}
            </Heading>
            <BodyShort className="mb">{translate(form.properties.innsendingForklaring)}</BodyShort>
            <DownloadPdfButton
              form={form}
              submission={submission}
              actionUrl={`${fyllutBaseURL}/api/pdf/convert`}
              label={translate(form.properties.downloadPdfButtonText || TEXTS.grensesnitt.downloadApplication)}
              onClick={() => loggSkjemaFullfort()}
              translations={translations}
              submissionMethod={"ingen"}
            />
          </div>
          <NavigateButtonComponent translate={translate} goBackUrl={`${formUrl}/oppsummering`} />
        </section>
      </section>
    </div>
  );
}
