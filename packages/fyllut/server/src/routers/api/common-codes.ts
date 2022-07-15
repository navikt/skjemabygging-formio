import { NextFunction, Request, Response } from "express";
import correlator from "express-correlation-id";
import fetch, { HeadersInit } from "node-fetch";
import { config } from "../../config/config";
import { responseToError } from "../../utils/errorHandling.js";

const { clientId } = config;

const commonCodes = {
  getArchiveSubjects: async (req: Request, res: Response, next: NextFunction) => {
    const languageCode: string = req.query.languageCode ? (req.query.languageCode as string) : "nb";

    try {
      const response = await fetchCommonCodes("Arkivtemaer", languageCode);
      const archiveSubjects: { [key: string]: string } = {};
      for (const [key, values] of Object.entries(response.betydninger)) {
        const term = (values as any)[0]?.beskrivelser?.[languageCode]?.term;
        archiveSubjects[key] = term ?? key;
      }
      res.send(archiveSubjects);
    } catch (e) {
      next(e);
    }
  },
};

const fetchCommonCodes = async (commonCode: commonCodeType, languageCode: string) => {
  const commonCodesUrl = "https://kodeverk.dev.intern.nav.no/api/v1/kodeverk"; // TODO: Change this to config
  const languageParam = languageCode ? `&spraak=${languageCode}` : "";

  const response = await fetch(
    `${commonCodesUrl}/${commonCode}/koder/betydninger?ekskluderUgyldige=true${languageParam}`,
    {
      method: "GET",
      headers: {
        "Nav-Call-Id": correlator.getId(),
        "Nav-Consumer-Id": clientId,
      } as HeadersInit,
    }
  );

  if (response.ok) {
    return response.json();
  }

  throw await responseToError(response, "Feil ved henting av enhetsliste", true);
};

type commonCodeType =
  | "Adressetyper"
  | "A-inntektsfilter"
  | "AnsettelsesformAareg"
  | "Applikasjoner"
  | "Arbeidsforholdstyper"
  | "Arbeidstidsordninger"
  | "Arbeidstillatelser"
  | "Arkivfiltyper"
  | "Arkivtemaer"
  | "Avlønningstyper"
  | "Avslutningsstatuser"
  | "Behandlingskjedetyper"
  | "Behandlingsstatuser"
  | "Behandlingsstegstatuser"
  | "Behandlingsstegtyper"
  | "Behandlingstema"
  | "Behandlingstyper"
  | "Beregnet skatt"
  | "Beregnet skatt filter"
  | "BeregningskodeForArbeidsgiveravgift"
  | "BrevkodeMottak"
  | "Brukertyper"
  | "Bydeler"
  | "DekningMedl"
  | "Diskresjonskoder"
  | "Dokumentkategorier"
  | "Dokumentstatuser"
  | "DokumentTypeId-er"
  | "EDAGTilleggsinfoKategorier"
  | "EEAFreg"
  | "EESSISkjema"
  | "EnhetstyperJuridiskEnhet"
  | "EnhetstyperNorg"
  | "EnhetstyperVirksomhet"
  | "Familierelasjoner"
  | "Fartsområder"
  | "FødelandFreg"
  | "Fordel"
  | "Foreldreansvarstyper"
  | "Formaal"
  | "Forskuddstrekkbeskrivelse"
  | "ForventetInntektHendelserUfoere"
  | "ForventetInntektInformasjonsopphavUfoere"
  | "ForventetInntektTyperUfoere"
  | "Fradragbeskrivelse"
  | "Fylker"
  | "GrunnlagMedl"
  | "Identstatuser"
  | "Informasjonsstatuser"
  | "InntektInformasjonsopphav"
  | "Inntektsmelding - årsak endring"
  | "Inntektsmelding - årsak utsettelse"
  | "Inntektsmelding - begrunnelse ikke utbetalt"
  | "Inntektsperiodetyper"
  | "Inntektsstatuser"
  | "Journalposttyper"
  | "Journalstatuser"
  | "KildedokumentMedl"
  | "KildesystemMedl"
  | "Kjønnstyper"
  | "Knytninger"
  | "Kommuner"
  | "Kommunikasjonskanaler"
  | "Krutkoder"
  | "LandAdresserFreg"
  | "Landgrupper"
  | "Landkoder"
  | "LandkoderISO2"
  | "Loennsbeskrivelse"
  | "LovvalgMedl"
  | "Målformer"
  | "Mitt-test-kodeverk"
  | "Mottakskanaler"
  | "Naeringsinntektsbeskrivelse"
  | "Næringskoder"
  | "NAVSkjema"
  | "Oppgavetyper"
  | "Oppholdstillatelser"
  | "Organisasjonsstatuser"
  | "PensjonEllerTrygdeBeskrivelse"
  | "PeriodestatusMedl"
  | "PeriodetypeMedl"
  | "PermisjonsOgPermitteringsBeskrivelse"
  | "Personidenter"
  | "Personstatuser"
  | "PersontypeForReiseKostLosji"
  | "Postadressetyper"
  | "Postnummer"
  | "Postnummer vegadresser"
  | "PrimærRelasjonstyper"
  | "RapporteringsordningAareg"
  | "Retningsnumre"
  | "Sektorkoder"
  | "SekundærRelasjonstyper"
  | "Sikkerhetsbegrensninger"
  | "Sivilstander"
  | "SkatteOgAvgiftsregel"
  | "Skipsregistre"
  | "Skipstyper"
  | "SluttårsakAareg"
  | "Spesielleinntjeningsforhold"
  | "Språk"
  | "StatsborgerskapFreg"
  | "StatusaarsakMedl"
  | "Summert skattegrunnlag"
  | "Summert skattegrunnlag filter"
  | "Telefontyper"
  | "Tema"
  | "Temagrupper"
  | "TemagrupperMidlertidig"
  | "TilknyttetJournalpostSom"
  | "TilrettelagtKommunikasjon"
  | "Tjenestesteder"
  | "Tjenestestedstyper"
  | "Umyndigkoder"
  | "Utlandsoppholdstyper"
  | "Utsendingskanaler"
  | "UtstederlandIDFreg"
  | "Valutaer"
  | "Variantformater"
  | "Varslingskode_Aa-registeret"
  | "Varslingstyper"
  | "Vedleggskoder"
  | "Venteårsaker"
  | "Vergemål_Fylkesmannsembeter"
  | "Vergemål_Mandattype"
  | "Vergemål_Sakstype"
  | "Vergemål_Vergetype"
  | "Yrker"
  | "YtelseFraOffentligeBeskrivelse"
  | "Ytelser";

export default commonCodes;
