import { NextFunction, Request, Response } from "express";
import correlator from "express-correlation-id";
import fetch, { HeadersInit } from "node-fetch";
import { config } from "../../config/config";
import { toJsonOrThrowError } from "../../utils/errorHandling.js";

const { clientId } = config;

const commonCodes = {
  getArchiveSubjects: (req: Request, res: Response, next: NextFunction) => {
    return fetchCommonCodes("Arkivtemaer")
      .then(toJsonOrThrowError("Feil ved henting av enhetsliste", true))
      .then((response) => res.send((<any>response).koder))
      .catch((error) => {
        next(error);
      });
  },
};

const fetchCommonCodes = (commonCode: commonCodeType) => {
  return fetch(`https://kodeverk.dev.intern.nav.no/api/v1/kodeverk/${commonCode}/koder`, {
    method: "GET",
    headers: {
      "Nav-Call-Id": correlator.getId(),
      "Nav-Consumer-Id": clientId,
    } as HeadersInit,
  });
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
