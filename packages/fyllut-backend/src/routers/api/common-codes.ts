import { correlator } from '@navikt/skjemadigitalisering-shared-backend';
import { Enhetstype, EnhetstypeNorg } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import fetch, { HeadersInit } from 'node-fetch';
import { config } from '../../config/config';
import { responseToError } from '../../utils/errorHandling';

const { clientId, kodeverk } = config;

const commonCodes = {
  getArchiveSubjects: async (req: Request, res: Response, next: NextFunction) => {
    const acceptLanguage = req.header('accept-language');
    const languageCode: string = acceptLanguage || 'nb';

    try {
      // Alle temakoder ligger i Arkivtemaer, men vi har fått laget eget kodeverk for oss som heter TemaIFyllUt
      const response = await fetchCommonCodeDescriptions(req, 'TemaIFyllUt', languageCode);
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

  getCurrencies: async (req: Request, res: Response, next: NextFunction) => {
    // As of 25.11.2024. Different languageCode like nn or en just results in same term,
    // so no need to support req.query.languageCode
    const languageCode = 'nb';
    const mostUsedCurr: { label: string; value: string }[] = [];
    const currencyList: { label: string; value: string }[] = [];

    try {
      const response = await fetchCommonCodeDescriptions(req, 'ValutaBetaling', languageCode);

      for (const [key, values] of Object.entries(response.betydninger)) {
        const currencyName = (values as any)[0]?.beskrivelser?.[languageCode]?.term;
        const newObj = { label: `${currencyName} (${key})`, value: key };
        if (key === 'NOK' || key === 'EUR' || key === 'SEK') {
          mostUsedCurr.push(newObj);
        } else {
          currencyList.push(newObj);
        }
      }
      sortAsc(currencyList, languageCode);
      sortAsc(mostUsedCurr, languageCode);

      const options = mostUsedCurr.concat(currencyList);
      res.send(options);
    } catch (e) {
      next(e);
    }
  },

  getEnhetstyper: async (req: Request, res: Response, next: NextFunction) => {
    const acceptLanguage = req.header('accept-language');
    const languageCode: string = acceptLanguage || 'nb';

    try {
      const response = await fetchCommonCodeDescriptions(req, 'EnhetstyperNorg', languageCode);
      const enhetstyper: EnhetstypeNorg[] = [];
      for (const [key, values] of Object.entries(response.betydninger)) {
        const term = (values as any)[0]?.beskrivelser?.[languageCode]?.term;
        enhetstyper.push({ kodenavn: key as Enhetstype, term: term ?? key });
      }
      res.send(enhetstyper);
    } catch (e) {
      next(e);
    }
  },

  getAreaCodes: async (req: Request, res: Response, next: NextFunction) => {
    const languageCode = 'nb';

    try {
      const response = await fetchCommonCodeDescriptions(req, 'Retningsnumre', languageCode);
      const areaCodes: { label: string; value: string }[] = [];
      for (const [key, values] of Object.entries(response.betydninger)) {
        const areaName = (values as any)[0]?.beskrivelser?.[languageCode]?.term;
        areaCodes.push({ label: `${key} ${areaName}`, value: key });
      }
      sortAsc(areaCodes, languageCode);
      res.send(areaCodes);
    } catch (e) {
      next(e);
    }
  },
};

const sortAsc = (list: { label: string; value: string }[], languageCode: string) => {
  return list.sort((a, b) => a.label.toUpperCase().localeCompare(b.label.toUpperCase(), languageCode));
};
/**
 * Doc: https://navikt.github.io/felleskodeverk/
 * Swagger: https://kodeverk.dev.intern.nav.no/swagger-ui.html
 */
const fetchCommonCodeDescriptions = async (
  req: Request,
  commonCode: commonCodeType,
  languageCode: string,
): Promise<any> => {
  const languageParam = languageCode ? `&spraak=${languageCode}` : '';
  const token = req.headers.AzureAccessToken;

  const response = await fetch(
    `${kodeverk.url}/api/v1/kodeverk/${commonCode}/koder/betydninger?ekskluderUgyldige=true${languageParam}`,
    {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        'x-correlation-id': correlator.getId(),
        'Nav-Call-Id': correlator.getId(),
        'Nav-Consumer-Id': clientId,
      } as HeadersInit,
    },
  );

  if (response.ok) {
    return response.json();
  }

  throw await responseToError(response, 'Feil ved henting fra felles kodeverk', true);
};

type commonCodeType =
  | 'Adressetyper'
  | 'A-inntektsfilter'
  | 'AnsettelsesformAareg'
  | 'Applikasjoner'
  | 'Arbeidsforholdstyper'
  | 'Arbeidstidsordninger'
  | 'Arbeidstillatelser'
  | 'Arkivfiltyper'
  | 'Arkivtemaer'
  | 'Avlønningstyper'
  | 'Avslutningsstatuser'
  | 'Behandlingskjedetyper'
  | 'Behandlingsstatuser'
  | 'Behandlingsstegstatuser'
  | 'Behandlingsstegtyper'
  | 'Behandlingstema'
  | 'Behandlingstyper'
  | 'Beregnet skatt'
  | 'Beregnet skatt filter'
  | 'BeregningskodeForArbeidsgiveravgift'
  | 'BrevkodeMottak'
  | 'Brukertyper'
  | 'Bydeler'
  | 'DekningMedl'
  | 'Diskresjonskoder'
  | 'Dokumentkategorier'
  | 'Dokumentstatuser'
  | 'DokumentTypeId-er'
  | 'EDAGTilleggsinfoKategorier'
  | 'EEAFreg'
  | 'EESSISkjema'
  | 'EnhetstyperJuridiskEnhet'
  | 'EnhetstyperNorg'
  | 'EnhetstyperVirksomhet'
  | 'Familierelasjoner'
  | 'Fartsområder'
  | 'FødelandFreg'
  | 'Fordel'
  | 'Foreldreansvarstyper'
  | 'Formaal'
  | 'Forskuddstrekkbeskrivelse'
  | 'ForventetInntektHendelserUfoere'
  | 'ForventetInntektInformasjonsopphavUfoere'
  | 'ForventetInntektTyperUfoere'
  | 'Fradragbeskrivelse'
  | 'Fylker'
  | 'GrunnlagMedl'
  | 'Identstatuser'
  | 'Informasjonsstatuser'
  | 'InntektInformasjonsopphav'
  | 'Inntektsmelding - årsak endring'
  | 'Inntektsmelding - årsak utsettelse'
  | 'Inntektsmelding - begrunnelse ikke utbetalt'
  | 'Inntektsperiodetyper'
  | 'Inntektsstatuser'
  | 'Journalposttyper'
  | 'Journalstatuser'
  | 'KildedokumentMedl'
  | 'KildesystemMedl'
  | 'Kjønnstyper'
  | 'Knytninger'
  | 'Kommuner'
  | 'Kommunikasjonskanaler'
  | 'Krutkoder'
  | 'LandAdresserFreg'
  | 'Landgrupper'
  | 'Landkoder'
  | 'LandkoderISO2'
  | 'Loennsbeskrivelse'
  | 'LovvalgMedl'
  | 'Målformer'
  | 'Mitt-test-kodeverk'
  | 'Mottakskanaler'
  | 'Naeringsinntektsbeskrivelse'
  | 'Næringskoder'
  | 'NAVSkjema'
  | 'Oppgavetyper'
  | 'Oppholdstillatelser'
  | 'Organisasjonsstatuser'
  | 'PensjonEllerTrygdeBeskrivelse'
  | 'PeriodestatusMedl'
  | 'PeriodetypeMedl'
  | 'PermisjonsOgPermitteringsBeskrivelse'
  | 'Personidenter'
  | 'Personstatuser'
  | 'PersontypeForReiseKostLosji'
  | 'Postadressetyper'
  | 'Postnummer'
  | 'Postnummer vegadresser'
  | 'PrimærRelasjonstyper'
  | 'RapporteringsordningAareg'
  | 'Retningsnumre'
  | 'Sektorkoder'
  | 'SekundærRelasjonstyper'
  | 'Sikkerhetsbegrensninger'
  | 'Sivilstander'
  | 'SkatteOgAvgiftsregel'
  | 'Skipsregistre'
  | 'Skipstyper'
  | 'SluttårsakAareg'
  | 'Spesielleinntjeningsforhold'
  | 'Språk'
  | 'StatsborgerskapFreg'
  | 'StatusaarsakMedl'
  | 'Summert skattegrunnlag'
  | 'Summert skattegrunnlag filter'
  | 'Telefontyper'
  | 'Tema'
  | 'TemaIFyllUt'
  | 'Temagrupper'
  | 'TemagrupperMidlertidig'
  | 'TilknyttetJournalpostSom'
  | 'TilrettelagtKommunikasjon'
  | 'Tjenestesteder'
  | 'Tjenestestedstyper'
  | 'Umyndigkoder'
  | 'Utlandsoppholdstyper'
  | 'Utsendingskanaler'
  | 'UtstederlandIDFreg'
  | 'Valutaer'
  | 'ValutaBetaling'
  | 'Variantformater'
  | 'Varslingskode_Aa-registeret'
  | 'Varslingstyper'
  | 'Vedleggskoder'
  | 'Venteårsaker'
  | 'Vergemål_Fylkesmannsembeter'
  | 'Vergemål_Mandattype'
  | 'Vergemål_Sakstype'
  | 'Vergemål_Vergetype'
  | 'Yrker'
  | 'YtelseFraOffentligeBeskrivelse'
  | 'Ytelser';

export default commonCodes;
