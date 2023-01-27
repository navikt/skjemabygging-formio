import { I18nTranslationMap, Language, NavFormType, Submission } from "@navikt/skjemadigitalisering-shared-domain";
import { NextFunction, Request, Response } from "express";
import correlator from "express-correlation-id";
import fetch, { HeadersInit } from "node-fetch";
import { config } from "../../config/config";
import { base64Decode, base64Encode } from "../../utils/base64";
import { responseToError } from "../../utils/errorHandling.js";
import { createHtmlFromSubmission } from "./helpers/htmlBuilder";

const { skjemabyggingProxyUrl } = config;

const testHtml = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Søknad om stønad til anskaffelse av motorkjøretøy og / eller spesialutstyr og tilpassing til bil</title>
    <style>
    body {}
    h1, h2, h3, h4, .spm {font-family: Arial;}
    .svar {margin-bottom: 5px; font-family: "Courier New", sans-serif;}
    .innrykk {margin: 0px 0px 10px 20px;}
    .underskrift {margin-bottom: 30px;}
</style>
</head>
<body>

<h2>Dine opplysninger</h2>
<div  class="spm">Fornavn</div>
<div  class="svar">- Per</div>
<div  class="spm">Etternavn</div>
<div  class="svar">- Andersen</div>
<div class="spm">Har du norsk fødselsnummer eller D-nummer?</div>
<div class="svar">- Ja</div>
<div class="spm">Fødselsnummer / D-nummer</div>
<div class="svar">- 20048119949</div>
<div class="spm">Er du under 18 år?</div>
<div class="svar">- Nei</div>
<div class="spm">Har du verge?</div>
<div class="svar">- Nei</div>

<h2>Veiledning</h2>
<div class="spm">Hva skal du søke om?</div>
<div class="svar">-  Stønad til spesialtilpasset kassebil</div>
<div class="spm">Hva skal du bruke bilen til?</div>
<div class="svar">-  Kjøring til og fra arbeid eller utdanningssted</div>
<div class="spm">Jeg forstår at jeg må sende legeerklæring og dokumentajon fra ergo- eller fysioterapeut for at NAV skal kunne behandle søknaden.</div>
<div class="svar">-  Ja</div>
<div class="spm">Jeg forstår at NAV bruker personopplysningene ovenfor for å behandle søknaden.</div>
<div class="svar">-  Ja</div>

<h2>Inntekt</h2>
<div class="spm">Jeg forstår at jeg må betale en egenandel på inntil 150 000 kroner dersom jeg og ektefellen, samboeren eller partneren min til sammen har en inntekt over 6 G.</div>
<div class="svar">- Ja</div>

<h2>Behov for bil</h2>
<div class="spm">Kan du reise kollektivt alene?</div>
<div class="svar">- Nei</div>
<div class="spm">Kan du reise kollektivt hvis du har med deg følge?</div>
<div class="svar">- Ja</div>
<div class="spm">Har du så stort transportbehov til og fra arbeid eller utdanningssted at du trenger egen bil?</div>
<div class="svar">- Ja</div>
<div class="spm">Mottar du noen av de følgende støtteordningene?</div>
<div class="svar">-  TT-kort eller andre tilsvarende kommunale transportordninger</div>
<div class="svar">-  Grunnstønad til transport, arbeids- og utdanningsreiser eller lignende</div>
<div class="spm">Hvor mange ganger i løpet av en måned reiser du til og fra arbeid eller utdanningsstedet?</div>
<div class="svar">- 88</div>
<div class="spm">Hvor mange kilometer er det mellom der du bor og arbeidsplassen din eller utdanningsstedet ditt?</div>
<div class="svar">- 56</div>
<div class="spm">Hvordan dekker du transportbehovet ditt til og fra arbeid eller utdanningssted i dag?</div>
<div class="svar">- Saken blir nå henlagt for intet straffbart forhold. – Det er ikke grunnlag for å hevde at noen bevisst har holdt disse opplysningene tilbake eller bevisst bidro til feilopplysning til statsadvokaten, og da senere til gjenopptakelseskommisjonen. Så dette er altså henlagt som intet straffbart forhold, sier Terje Nybøe, sjef for Spesialenheten til NRK.</div>
<div class="spm">Er du avhengig av hjelpemidler for å forflytte deg?</div>
<div class="svar">- Ja</div>
<div class="spm">Hvilke hjelpemidler er du avhengig av for å forflytte deg?</div>
<div class="svar">- Verken tidligere etterforskningsleder Arne Pedersen eller Agder politidistrikt har gjort tjenestefeil i Baneheia-saken. Det er Spesialenhetens konklusjon etter flere måneder med etterforskning.</div>

<h2>Førerkort</h2>
<div class="spm">Har du førerkort som er gyldig i Norge?</div>
<div class="svar">- Ja</div>

<h2>Eier du bil?</h2>
<div class="spm">Eier du bil?</div>
<div class="svar">- Nei</div>
<div class="spm">Har du eid en bil i løpet av de siste 6 månedene?</div>
<div class="svar"Nei></div>
<div class="spm">Er det andre i husstanden din som eier bil i dag?</div>
<div class="svar">- Ja</div>
<div class="spm">Hvem i husstanden eier bil i dag?</div>
<div class="svar">- Samboer</div>

<div class="innrykk">
<h3>Bilen(e)s registreringsnummer</h3>
<div class="spm">Registreringsnummer</div>
<div class="svar">- DJ56378</div>
<div class="spm">Registreringsnummer</div>
<div class="svar">- KU48729</div>
</div>

<div class="spm">Kan du bruke noen av bilen(e)?</div>
<div class="svar">- Nei</div>
<div class="spm">Oppgi hvorfor du ikke kan bruke bilen(e)</div>
<div class="svar">- Spesialenhetens etterforskning har vært rettet mot tidligere krimsjef Arne Pedersen og Agder Politidistrikt.</div>

<h2>Fastlege</h2>
<div class="spm">Har du fastlege?</div>
<div class="svar">- Ja</div>
<div class="spm">Fornavn</div>
<div class="svar">- Dr.</div>
<div class="spm">Etternavn</div>
<div class="svar">- Dyrego</div>
<div class="spm">Navn på fastlegekontor</div>
<div class="svar">- DD & Dyrene</div>
<div class="spm">Postadresse</div>
<div class="svar">- Navergata 123</div>
<div class="spm">Postnummer</div>
<div class="svar">- 0235</div>
<div class="spm">Poststed</div>
<div class="svar">- Oslo</div>
<div class="spm">Telefonnummer</div>
<div class="svar">- 86759323</div>

<h2>Tilleggsopplysninger</h2>
<div class="spm">Tilleggsopplysninger</div>
<div class="svar">- Spesialenhetens etterforskning har vært rettet mot tidligere krimsjef Arne Pedersen og Agder Politidistrikt.</div>

<h2>Vedlegg</h2>
<div class="spm">Legeerklæring for motorkjøretøy, NAV 10-07.42</div>
<div class="svar">- Jeg legger det ved denne søknaden (anbefalt)</div>
<div class="spm">Erklæring fra ergo- eller fysioterapeut i forbindelse med søknad om motorkjøretøy og spesialutstyr / tilpasning, NAV 10-07.43</div>
<div class="svar">- Jeg legger det ved denne søknaden (anbefalt)</div>
<div class="spm">Dokumentasjon av veiforhold</div>
<div class="svar">- Jeg legger det ved denne søknaden (anbefalt)</div>
<div class="spm">Kopi av førerkortet ditt</div>
<div class="svar">- Jeg ettersender dokumentasjonen senere (jeg er klar over at NAV ikke kan behandle søknaden før jeg har levert dokumentasjonen)</div>

<h2>Bekreftelse av opplysninger</h2>
<div class="spm">Jeg bekrefter at opplysningene er riktige, og at feil opplysninger kan få konsekvenser for stønaden.</div>
<div class="svar">- Ja</div>

<h2>Underskrift</h2>
<div>Signér på de stedene som er aktuelle for din stønad.</div>
<div class="underskrift">NB! Har du to foreldre må begge signere søknaden.</div>

<h3>Søker / verge</h3>
<div>_____________________________________________________________</div>
<div class="underskrift">Sted og dato</div>
<div>_____________________________________________________________</div>
<div class="underskrift">Underskrift</div>

<h3>Forelder 1</h3>
<div>_____________________________________________________________</div>
<div class="underskrift">Sted og dato</div>
<div>_____________________________________________________________</div>
<div class="underskrift">Underskrift</div>

<h3>Forelder 2</h3>
<div>_____________________________________________________________</div>
<div class="underskrift">Sted og dato</div>
<div>_____________________________________________________________</div>
<div class="underskrift">Underskrift</div>

<div class="spm"></div>
<div class="svar">- </div>
</body>
</html>`;

const parseBody = (
  req: Request
): {
  form: NavFormType;
  submission: Submission;
  translations: I18nTranslationMap;
  language: Language;
} => {
  const submission = JSON.parse(req.body.submission);
  const form = JSON.parse(req.body.form);
  const translations = JSON.parse(req.body.translations);
  const language = req.body.language;
  return { form, submission, translations, language };
};

const exstream = {
  //TODO: remove get
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pdf = await createPdf(
        req.headers.AzureAccessToken as string,
        "Søknad om stønad til anskaffelse av motorkjøretøy og / eller spesialutstyr og tilpassing til bil",
        "NAV-123",
        "nb-NO",
        testHtml
      );
      res.contentType(pdf.contentType);
      res.send(base64Decode(pdf.data));
    } catch (e) {
      next(e);
    }
  },
  post: async (req: Request, res: Response, next: NextFunction) => {
    console.log("POST");
    try {
      const { form, submission, translations, language } = parseBody(req);
      const translate = (text: string): string => translations[text] || text;
      const html = createHtmlFromSubmission(form, submission, translate, language);
      const pdf = await createPdf(
        req.headers.AzureAccessToken as string,
        translate(form.title),
        form.properties.skjemanummer,
        language,
        html
      );
      res.contentType(pdf.contentType);
      res.send(base64Decode(pdf.data));
    } catch (e) {
      next(e);
    }
  },
};

const createPdf = async (
  azureAccessToken: string,
  title: string,
  skjemanummer: string,
  language: Language,
  html: string
) => {
  if (!html || Object.keys(html).length === 0) {
    throw Error("Missing HTML for generating PDF.");
  }

  const response = await fetch(`${skjemabyggingProxyUrl}/exstream`, {
    headers: {
      Authorization: `Bearer ${azureAccessToken}`,
      "x-correlation-id": correlator.getId(),
      "Content-Type": "application/json",
    } as HeadersInit,
    method: "POST",
    body: JSON.stringify({
      content: {
        contentType: "application/json",
        data: base64Encode(
          JSON.stringify({
            dokumenttypeId: "fs_001",
            dokumentTittel: title,
            arkivSystem: "INGEN",
            spraakkode: language,
            blankettnr: skjemanummer,
            brukersFnr: "20048119949",
            skjemaversjon: "8b4d3fbc9b5be00d1db0285ec013f9dbc6750631",
            html: base64Encode(html),
          })
        ),
        async: "true",
      },
      RETURNFORMAT: "PDF",
      RETURNDATA: "TRUE",
    }),
  });

  if (response.ok) {
    const json = await response.json();
    return json.data.result[0].content;
  }

  throw await responseToError(response, "Feil ved generering av PDF hos Exstream", true);
};

export default exstream;
