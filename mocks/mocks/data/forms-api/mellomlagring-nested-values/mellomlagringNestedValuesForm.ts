import {
  alert,
  attachment,
  checkbox,
  container,
  countrySelect,
  currency,
  dataGrid,
  datePicker,
  formGroup,
  htmlElement,
  nationalIdentityNumber,
  number,
  organizationNumber,
  panel,
  phoneNumber,
  radio,
  select,
  selectBoxes,
  textArea,
  textField,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const mellomlagringNestedValuesForm = () =>
  form({
    title: 'Søknad om medlemskap i folketrygden under opphold utenfor EØS',
    formNumber: 'nav020805',
    path: 'nav020805',
    components: [
      panel({
        key: 'veiledning',
        title: 'Veiledning',
        components: [
          htmlElement({
            content: `<p>Dette skjemaet bruker du dersom du skal arbeide eller oppholde deg i land utenfor EØS-området.</p>

<p>Hvis du er sendt ut av arbeidsgiveren din, må arbeidsgiveren bekrefte dette ved å fylle ut
vedleggsskjemaet <a href="https://www.nav.no/fyllut/nav020806" target="_blank">NAV 02-08.06 Skjema for arbeidsgiver - bekreftelse på utsending (åpnes i ny fane)</a>. 
Du trenger ikke legge ved skjemaet hvis du arbeider i staten og er statsborger i Norge, et annet EØS-land eller Sveits.</p>


<p>I noen tilfeller skal du bruke skjemaet også hvis du skal arbeide eller oppholde deg innenfor EØS-området. Dette gjelder hvis du er</p>
<ul>
  <li>statsborger i et land utenfor EU/EØS</li>
  <li>pensjonist eller uføretrygdet og skal søke om frivillig medlemskap</li>
</ul>`,
            key: 'veiledningstekst',
          }),
          radio({
            key: 'fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv',
            label: 'Fyller du ut  søknaden på  vegne av andre  enn deg selv? ',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          alert({
            alerttype: 'warning',
            conditional: {
              show: true,
              when: 'fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv',
              eq: 'ja',
            },
            content: `<p>Når du søker på vegne av andre enn deg selv må du sende søknaden per post.</p>
<ul>
  <li><p>Hvis du valgte "Send i posten" på forrige side kan du fortsette utfyllingen her.</p></li>
  <li><p>Hvis du valgte "Send digitalt" må du 
<a href="https://www.nav.no/fyllut/nav020805"> gå tilbake og velge "Send i posten"</a>.</p></li>
</ul>`,
            key: 'alertstripe5',
          }),
        ],
      }),
      panel({
        key: 'fullmakt',
        title: 'Fullmakt',
        components: [
          radio({
            conditional: {
              show: true,
              when: 'fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv',
              eq: 'ja',
            },
            key: 'hvorforSokerDuPaVegneAvEnAnnenPerson',
            label: 'Hvorfor søker  du på vegne av  en annen  person?',
            values: [
              { label: 'Jeg har fullmakt', value: 'jegHarFullmakt' },
              {
                label: 'Jeg representerer en virksomhet med fullmakt',
                value: 'jegRepresentererEnVirksomhetMedFullmakt',
              },
              { label: 'Jeg er foresatt eller verge', value: 'jegErForesattEllerVerge' },
            ],
          }),
          container({
            conditional: {
              show: true,
              when: 'hvorforSokerDuPaVegneAvEnAnnenPerson',
              eq: 'jegHarFullmakt',
            },
            key: 'dineOpplysninger1',
            label: 'Personopplysninger for den som har fått fullmakt',
            components: [
              alert({
                conditional: {
                  show: true,
                  when: 'fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv',
                  eq: 'ja',
                },
                content: `Du som fyller ut søknaden må gi opplysninger om deg selv nedenfor. 
Resten av spørsmålene i skjemaet handler om personen som du søker for, selv om tekstene er formulert i <b>du-form</b>.`,
                key: 'alertstripe1',
              }),
              textField({
                autocomplete: 'given-name',
                key: 'fornavn',
                label: 'Fornavn',
              }),
              textField({
                autocomplete: 'family-name',
                key: 'etternavn',
                label: 'Etternavn',
              }),
            ],
          }),
          container({
            conditional: {
              show: true,
              when: 'hvorforSokerDuPaVegneAvEnAnnenPerson',
              eq: 'jegErForesattEllerVerge',
            },
            key: 'dineOpplysninger2',
            label: 'Personopplysninger for den som er foresatt/ verge',
            components: [
              alert({
                conditional: {
                  show: true,
                  when: 'fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv',
                  eq: 'ja',
                },
                content: `Du som fyller ut søknaden må gi opplysninger om deg selv nedenfor. 
Resten av spørsmålene i skjemaet handler om personen som du søker for, selv om tekstene er formulert i <b>du-form</b>.`,
                key: 'alertstripe1',
              }),
              textField({
                autocomplete: 'given-name',
                key: 'fornavn',
                label: 'Fornavn',
              }),
              textField({
                autocomplete: 'family-name',
                key: 'etternavn',
                label: 'Etternavn',
              }),
            ],
          }),
          container({
            conditional: {
              show: true,
              when: 'hvorforSokerDuPaVegneAvEnAnnenPerson',
              eq: 'jegRepresentererEnVirksomhetMedFullmakt',
            },
            key: 'firmaopplysninger',
            label: 'Firmaopplysninger for det firmaet som har gitt fullmakt',
            components: [
              alert({
                content: `Du som fyller ut søknaden må gi opplysninger om deg selv nedenfor. 
Resten av spørsmålene i skjemaet handler om personen som du søker for, selv om tekstene er formulert i <b>du-form</b>.`,
                key: 'alertstripe3',
              }),
              textField({
                key: 'virksomhetensNavn',
                label: 'Virksomhetens navn',
              }),
              organizationNumber({
                key: 'orgNr',
                label: 'Organisasjonsnummer',
                validate: {
                  custom: 'valid = instance.validateOrganizationNumber(input)',
                },
              }),
            ],
          }),
        ],
      }),
      panel({
        key: 'dineOpplysninger',
        title: 'Dine opplysninger',
        components: [
          textField({
            autocomplete: 'given-name',
            key: 'fornavnSoker',
            label: 'Fornavn',
          }),
          textField({
            autocomplete: 'family-name',
            key: 'etternavnSoker',
            label: 'Etternavn',
          }),
          radio({
            key: 'harDuNorskFodselsnummerEllerDNummer',
            label: 'Har du norsk fødselsnummer eller d-nummer?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          nationalIdentityNumber({
            conditional: {
              show: true,
              when: 'harDuNorskFodselsnummerEllerDNummer',
              eq: 'ja',
            },
            key: 'fodselsnummerDNummerSoker',
            label: 'Fødselsnummer/d-nummer',
            validate: {
              custom: 'valid = instance.validateFnrNew(input)',
            },
          }),
          datePicker({
            conditional: {
              show: true,
              when: 'harDuNorskFodselsnummerEllerDNummer',
              eq: 'nei',
            },
            key: 'fodselsdatoDdMmAaaaSoker',
            label: 'Din fødselsdato (dd.mm.åååå)',
            validate: {
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
          alert({
            conditional: {
              show: true,
              when: 'harDuNorskFodselsnummerEllerDNummer',
              eq: 'ja',
            },
            content:
              '<p>NAV sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse. Du kan <a href="https://www.skatteetaten.no/person/folkeregister/flytte/endre-postadresse/ " target="_blank" rel="noopener noreferrer"> sjekke og endre din folkeregistrerte adresse på skatteetatens nettsider (åpnes i ny fane)</a>.</p>',
            key: 'alertstripe',
          }),
          radio({
            conditional: {
              show: true,
              when: 'harDuNorskFodselsnummerEllerDNummer',
              eq: 'nei',
            },
            key: 'borDuINorge',
            label: 'Bor du i Norge?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          radio({
            conditional: {
              show: true,
              when: 'borDuINorge',
              eq: 'ja',
            },
            key: 'vegadresseEllerPostboksadresse',
            label: 'Er kontaktadressen din en vegadresse eller postboksadresse?',
            values: [
              { label: 'Vegadresse', value: 'vegadresse' },
              { label: 'Postboksadresse', value: 'postboksadresse' },
            ],
          }),
          formGroup({
            conditional: {
              show: true,
              when: 'vegadresseEllerPostboksadresse',
              eq: 'vegadresse',
            },
            key: 'navSkjemagruppeVegadresse',
            label: 'Kontaktadresse',
            legend: 'Kontaktadresse',
            components: [
              container({
                hideLabel: true,
                key: 'norskVegadresse',
                label: 'Kontaktadresse',
                components: [
                  textField({
                    key: 'coSoker',
                    label: 'C/O',
                  }),
                  textField({
                    autocomplete: 'street-address',
                    key: 'vegadresseSoker',
                    label: 'Vegadresse',
                  }),
                  textField({
                    autocomplete: 'postal-code',
                    key: 'postnrSoker',
                    label: 'Postnummer',
                  }),
                  textField({
                    autocomplete: 'address-level2',
                    key: 'poststedSoker',
                    label: 'Poststed',
                  }),
                ],
              }),
              datePicker({
                key: 'gyldigFraDatoDdMmAaaa1',
                label: 'Fra hvilken dato skal denne adressen brukes?  (dd.mm.åååå)',
                validate: {
                  custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                },
              }),
              datePicker({
                beforeDateInputKey: 'gyldigFraDatoDdMmAaaa1',
                description:
                  'Du velger selv hvor lenge adressen skal være gyldig, maksimalt 1 år. Etter 1 år må du endre eller forlenge adressen.',
                key: 'gyldigTilDatoDdMmAaaa1',
                label: 'Til hvilken dato skal denne adressen brukes? (dd.mm.åååå)',
                validate: {
                  required: false,
                  custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                },
              }),
            ],
          }),
          formGroup({
            conditional: {
              show: true,
              when: 'vegadresseEllerPostboksadresse',
              eq: 'postboksadresse',
            },
            key: 'navSkjemagruppePostboksadresse',
            label: 'Kontaktadresse',
            legend: 'Kontaktadresse',
            components: [
              container({
                hideLabel: true,
                key: 'norskPostboksadresse',
                label: 'Postboksadresse',
                components: [
                  textField({
                    key: 'coSoker',
                    label: 'C/O',
                  }),
                  textField({
                    key: 'postboksNrSoker',
                    label: 'Postboks',
                  }),
                  textField({
                    autocomplete: 'postal-code',
                    key: 'postnrSoker',
                    label: 'Postnummer',
                  }),
                  textField({
                    autocomplete: 'address-level2',
                    key: 'poststedSoker',
                    label: 'Poststed',
                  }),
                ],
              }),
              datePicker({
                key: 'gyldigFraDatoDdMmAaaa2',
                label: 'Fra hvilken dato skal denne adressen brukes? (dd.mm.åååå)',
                validate: {
                  custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                },
              }),
              datePicker({
                beforeDateInputKey: 'gyldigFraDatoDdMmAaaa2',
                description:
                  'Du velger selv hvor lenge adressen skal være gyldig, maksimalt 1 år. Etter 1 år må du endre eller forlenge adressen.',
                key: 'gyldigTilDatoDdMmAaaa2',
                label: 'Til hvilken dato skal denne adressen brukes? (dd.mm.åååå)',
                validate: {
                  required: false,
                  custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                },
              }),
            ],
          }),
          formGroup({
            conditional: {
              show: true,
              when: 'borDuINorge',
              eq: 'nei',
            },
            key: 'navSkjemagruppeUtland',
            label: 'Utenlandsk kontaktadresse',
            legend: 'Utenlandsk kontaktadresse',
            components: [
              container({
                hideLabel: true,
                key: 'utenlandskAdresse',
                label: 'Utenlandsk kontaktadresse',
                components: [
                  textField({
                    key: 'coSoker',
                    label: 'C/O',
                  }),
                  textField({
                    autocomplete: 'street-address',
                    key: 'postboksNrSoker',
                    label: 'Vegnavn og husnummer, evt. postboks',
                  }),
                  textField({
                    key: 'bygningSoker',
                    label: 'Bygning',
                  }),
                  textField({
                    autocomplete: 'postal-code',
                    key: 'postnrSoker',
                    label: 'Postkode',
                  }),
                  textField({
                    autocomplete: 'address-level2',
                    key: 'poststedSoker',
                    label: 'By / stedsnavn',
                  }),
                  textField({
                    autocomplete: 'address-level1',
                    key: 'regionSoker',
                    label: 'Region',
                  }),
                  countrySelect({
                    key: 'land',
                    label: 'Land',
                  }),
                ],
              }),
              datePicker({
                key: 'gyldigFraDatoDdMmAaaa',
                label: 'Fra hvilken dato skal denne adressen brukes? (dd.mm.åååå)',
                validate: {
                  custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                },
              }),
              datePicker({
                beforeDateInputKey: 'gyldigFraDatoDdMmAaaa',
                description:
                  'Du velger selv hvor lenge adressen skal være gyldig, maksimalt 1 år. Etter 1 år må du endre eller forlenge adressen.',
                key: 'gyldigTilDatoDdMmAaaa',
                label: 'Til hvilken dato skal denne adressen brukes? (dd.mm.åååå)',
                validate: {
                  custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                },
              }),
            ],
          }),
          phoneNumber({
            key: 'telefonnummer',
            label: 'Telefonnummer',
          }),
        ],
      }),
      panel({
        key: 'opplysningerOmSoknaden',
        title: 'Opplysninger om søknaden',
        components: [
          countrySelect({
            key: 'hvilketLandSkalDuTil',
            label: 'Hvilket land skal du til?',
          }),
          formGroup({
            key: 'navSkjemagruppe3',
            label: 'Skjemagruppe',
            legend: 'Hvilken periode søker du for? ',
            components: [
              datePicker({
                conditional: {
                  show: false,
                  when: 'oppholdetErPermanentEllerPaUbestemtTid',
                  eq: 'ja',
                },
                key: 'fraDatoDdMmAaaa',
                label: 'Fra dato (dd.mm.åååå)',
                validate: {
                  custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                },
              }),
              datePicker({
                beforeDateInputKey: 'fraDatoDdMmAaaa',
                conditional: {
                  show: false,
                  when: 'oppholdetErPermanent',
                  eq: true,
                },
                description: 'Oppgi omtrentlig dato hvis du ikke vet nøyaktig dato.',
                key: 'tilDatoDdMmAaaa',
                label: 'Til dato (dd.mm.åååå)',
                mayBeEqual: true,
                validate: {
                  custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                },
              }),
              checkbox({
                key: 'oppholdetErPermanent',
                label: 'Oppholdet er permanent',
              }),
            ],
          }),
          radio({
            description: 'Du behøver ikke å oppgi kortere ferieopphold.',
            key: 'harDuOppholdtDegIUtlandetDeSisteFemArene',
            label: 'Har du oppholdt  deg i utlandet de  siste fem årene?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          dataGrid({
            addAnother: 'Ny periode',
            conditional: {
              show: true,
              when: 'harDuOppholdtDegIUtlandetDeSisteFemArene',
              eq: 'ja',
            },
            key: 'perioderMedOppholdIUtlandetSisteFemAr',
            label: 'Perioder med opphold i utlandet siste fem år',
            components: [
              datePicker({
                key: 'fraDatoDdMmAaaa',
                label: 'Fra dato (dd.mm.åååå)',
                validate: {
                  custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                },
              }),
              datePicker({
                beforeDateInputKey: 'perioderMedOppholdIUtlandetSisteFemAr.fraDatoDdMmAaaa',
                key: 'tilDatoDdMmAaaa',
                label: 'Til dato (dd.mm.åååå)',
                mayBeEqual: true,
                validate: {
                  custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                },
              }),
              countrySelect({
                key: 'landvelger',
                label: 'Hvilket land var du i?',
              }),
              textArea({
                key: 'hvaGjordeDu',
                label: 'Hva gjorde du?',
              }),
            ],
          }),
          radio({
            key: 'hvilkenTrygdedekningSokerDuOm',
            label: 'Hvilken  trygdedekning  søker du om? ',
            values: [
              { label: 'Helsedelen', value: 'helsedelen' },
              { label: 'Pensjonsdelen', value: 'pensjonsdelen' },
              { label: 'Både helse- og pensjonsdelen', value: 'badeHelseOgPensjonsdelen' },
            ],
          }),
          alert({
            content:
              '<p>Medlemskap i helsedelen omfatter stønad til helsetjenester og engangsstønad ved fødsel og adopsjon. I tilknytning til helsedelen kan du søke om rett til sykepenger og foreldrepenger.<br><br>Medlemskap i pensjonsdelen omfatter alderspensjon, uføretrygd, ytelser til gjenlevende ektefelle, barnepensjon, dagpenger ved arbeidsledighet, stønad til enslig far eller mor, gravferdsstønad, grunn- og hjelpestønad, arbeidsavklaringspenger, samt stønad til tidligere familiepleier.<br><br>I noen tilfeller er trygdedekningen bestemt på bakgrunn av situasjonen din. Dette gjelder for eksempel hvis du er pliktig medlem under utenlandsoppholdet ditt.</p>',
            key: 'alertstripe1',
            textDisplay: 'form',
          }),
          radio({
            customConditional: `show=
(data.hvilkenTrygdedekningSokerDuOm === "helsedelen") ||
(data.hvilkenTrygdedekningSokerDuOm === "badeHelseOgPensjonsdelen");`,
            key: 'sokerDuITilleggOmRettTilSykepengerOgForeldrepenger',
            label: 'Søker du i tillegg  om rett til  sykepenger og  foreldrepenger?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
        ],
      }),
      panel({
        key: 'opplysningerOmUtenlandsoppholdet',
        title: 'Opplysninger om utenlandsoppholdet',
        components: [
          radio({
            key: 'skalDuArbeideEllerDriveNaeringIUtlandet',
            label: 'Skal du  arbeide eller  drive næring  i utlandet?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          selectBoxes({
            conditional: {
              show: true,
              when: 'skalDuArbeideEllerDriveNaeringIUtlandet',
              eq: 'ja',
            },
            key: 'hvaErDinArbeidssituasjonIPerioden1',
            label: 'Hva er  arbeidssituasjonen din?',
            values: [
              { label: 'Lønnsmottaker', value: 'lonnsmottaker' },
              { label: 'Selvstendig næringsdrivende', value: 'selvstendigNaeringsdrivende' },
              {
                label: 'Au pair/praktikant eller arbeid ved siden av studier',
                value: 'auPairPraktikantEllerArbeidVedSidenAvStudier',
              },
              { label: 'Annen', value: 'annet' },
            ],
          }),
          textField({
            conditional: {
              show: true,
              when: 'skalDuArbeideEllerDriveNaeringIUtlandet',
              eq: 'ja',
            },
            key: 'hvilkenStillingHarDu',
            label: 'Hvilken stilling har du?',
          }),
          selectBoxes({
            conditional: {
              show: true,
              when: 'skalDuArbeideEllerDriveNaeringIUtlandet',
              eq: 'nei',
            },
            key: 'hvaErDinSituasjonIPerioden',
            label: 'Hva er situasjonen din i perioden?',
            values: [
              { label: 'Jeg mottar pensjon eller uføretrygd', value: 'jegMottarPensjonEllerUforetrygd' },
              { label: 'Jeg studerer', value: 'jegStuderer' },
              { label: 'Jeg følger med et familiemedlem', value: 'jegFolgerMedEtFamiliemedlem' },
              { label: 'Annen', value: 'annet' },
            ],
          }),
        ],
      }),
      panel({
        key: 'lonnsmottaker',
        title: 'Lønnsmottaker',
        components: [
          container({
            hideLabel: true,
            key: 'lonnsmottaker2',
            label: 'Lønnsmottaker',
            components: [
              radio({
                key: 'erDuSendtUtAvEnNorskArbeidsgiverForAJobbeIUtlandet',
                label: 'Er du sendt ut av  en norsk  arbeidsgiver for  å jobbe i  utlandet?',
                values: [
                  { label: 'Ja', value: 'ja' },
                  { label: 'Nei', value: 'nei' },
                ],
              }),
              radio({
                conditional: {
                  show: true,
                  when: 'lonnsmottaker2.erDuSendtUtAvEnNorskArbeidsgiverForAJobbeIUtlandet',
                  eq: 'nei',
                },
                key: 'skalDuJobbeForEnNorskEllerUtenlandskArbeidsgiver',
                label: 'Skal du jobbe for  en norsk eller  utenlandsk  arbeidsgiver? ',
                values: [
                  { label: 'Norsk', value: 'norsk' },
                  { label: 'Utenlandsk', value: 'utenlandsk' },
                ],
              }),
            ],
          }),
          container({
            customConditional: `show=
(data.lonnsmottaker2.erDuSendtUtAvEnNorskArbeidsgiverForAJobbeIUtlandet === "ja") ||
(data.lonnsmottaker2.skalDuJobbeForEnNorskEllerUtenlandskArbeidsgiver === "norsk");`,
            hideLabel: true,
            key: 'norskArbeidsgiver',
            label: 'Norsk arbeidsgiver',
            components: [
              textField({
                key: 'virksomhetensNavn',
                label: 'Navn på arbeidsgiveren',
              }),
              organizationNumber({
                customConditional: `show=
(data.norskArbeidsgiver.jegVetIkkeHvaVirksomhetsnummeretEr === false);`,
                key: 'orgNr',
                label: 'Organisasjonsnummeret til underenheten der du er ansatt',
                validate: {
                  custom: 'valid = instance.validateOrganizationNumber(input)',
                },
              }),
              alert({
                content: `Alle virksomheter består av en hovedenhet og en eller flere underenheter. Både hovedenhet og
underenheten har egne organisasjonsnumre. Vi spør om organisasjonsnummeret til
underenheten der du er ansatt fordi vi trenger opplysninger om arbeidsforholdet ditt.  <br><br>

Organisasjonsnummeret har ni siffer. Hvis du har navn eller organisasjonsnummeret til
hovedenheten, kan du finne informasjon om underenheter på Brønnøysundregistrenes
hjemmeside.
`,
                customConditional: `show=
(data.norskArbeidsgiver.jegVetIkkeHvaVirksomhetsnummeretEr === false);`,
                key: 'alertstripe',
              }),
              checkbox({
                defaultValue: false,
                key: 'jegVetIkkeHvaVirksomhetsnummeretEr',
                label: 'Jeg vet ikke hva organisasjonsnummeret er',
              }),
              container({
                customConditional: `show=
(data.norskArbeidsgiver.jegVetIkkeHvaVirksomhetsnummeretEr === true);`,
                key: 'arbeidsgiversAdresseopplysninger',
                label: 'Arbeidsgivers adresseopplysninger',
                components: [
                  textField({
                    autocomplete: 'street-address',
                    key: 'adresse',
                    label: 'Adresse',
                  }),
                  textField({
                    autocomplete: 'postal-code',
                    key: 'postnr',
                    label: 'Postnummer',
                  }),
                  textField({
                    autocomplete: 'address-level2',
                    key: 'poststed',
                    label: 'Poststed',
                  }),
                ],
              }),
              radio({
                conditional: {
                  show: true,
                  when: 'lonnsmottaker2.erDuSendtUtAvEnNorskArbeidsgiverForAJobbeIUtlandet',
                  eq: 'ja',
                },
                key: 'hvemLonnesDuAvISoknadsperioden',
                label: 'Hvem lønnes du  av i  søknadsperioden?',
                values: [
                  { label: 'Samme arbeidsgiver som over', value: 'sammeVirksomhet' },
                  { label: 'En annen norsk virksomhet', value: 'enAnnenNorskVirksomhet' },
                  { label: 'En utenlandsk virksomhet', value: 'enUtenlandskVirksomhet' },
                ],
              }),
            ],
          }),
          container({
            conditional: {
              show: true,
              when: 'norskArbeidsgiver.hvemLonnesDuAvISoknadsperioden',
              eq: 'enAnnenNorskVirksomhet',
            },
            hideLabel: true,
            key: 'annenNorskVirksomhet',
            label: 'Annen norsk virksomhet',
            components: [
              textField({
                key: 'denAndreVirksomhetensNavn',
                label: 'Navn på virksomheten',
              }),
              organizationNumber({
                customConditional: `show=
(data.annenNorskVirksomhet.jegVetIkkeHvaVirksomhetsnummeretEr === false);`,
                key: 'orgNr',
                label: 'Organisasjonsnummer',
                validate: {
                  custom: 'valid = instance.validateOrganizationNumber(input)',
                },
              }),
              alert({
                content: `Alle virksomheter består av en hovedenhet og en eller flere underenheter. 
Både hovedenhet og underenheten har egne organisasjonsnumre. 
Vi spør om organisasjonsnummeret til underenheten der du er ansatt fordi vi trenger opplysninger om arbeidsforholdet ditt.  <br><br>

Organisasjonsnummeret har ni siffer. 
Hvis du har navn eller organisasjonsnummeret til hovedenheten, kan du finne informasjon om underenheter på Brønnøysundregistrenes hjemmeside.`,
                customConditional: `show=
(data.annenNorskVirksomhet.jegVetIkkeHvaVirksomhetsnummeretEr === false);`,
                key: 'alertstripe',
              }),
              checkbox({
                defaultValue: false,
                key: 'jegVetIkkeHvaVirksomhetsnummeretEr',
                label: 'Jeg vet ikke hva organisasjonsnummeret er',
              }),
              container({
                customConditional: `show=
(data.annenNorskVirksomhet.jegVetIkkeHvaVirksomhetsnummeretEr === true);`,
                key: 'container',
                label: 'Oppgi adresseopplysninger for den andre norske virksomheten',
                components: [
                  textField({
                    autocomplete: 'street-address',
                    key: 'adresse',
                    label: 'Adresse',
                  }),
                  textField({
                    autocomplete: 'postal-code',
                    key: 'postnr',
                    label: 'Postnummer',
                  }),
                  textField({
                    autocomplete: 'address-level2',
                    key: 'poststed',
                    label: 'Poststed',
                  }),
                ],
              }),
            ],
          }),
          container({
            customConditional: `show=
(data.lonnsmottaker2.skalDuJobbeForEnNorskEllerUtenlandskArbeidsgiver === "utenlandsk") ||
(data.norskArbeidsgiver.hvemLonnesDuAvISoknadsperioden === "enUtenlandskVirksomhet");`,
            hideLabel: true,
            key: 'utenlandskVirksomhet',
            label: 'Utenlandsk virksomhet',
            components: [
              textField({
                customConditional: `show=
(data.norskArbeidsgiver.hvemLonnesDuAvISoknadsperioden === "enUtenlandskVirksomhet");`,
                key: 'denUtenlandskeVirksomhetensNavn',
                label: 'Navn på virksomheten',
              }),
              textField({
                customConditional: `show=

(data.lonnsmottaker2.skalDuJobbeForEnNorskEllerUtenlandskArbeidsgiver === "utenlandsk");`,
                key: 'navnPaArbeidsgiver',
                label: 'Navn på arbeidsgiver',
              }),
              number({
                key: 'virksomhetsnrRegistreringsnr',
                label: 'Organisasjonsnummer',
              }),
              textField({
                key: 'adresse',
                label: 'Adresse',
              }),
              textField({
                key: 'postnummer1',
                label: 'Postnummer',
              }),
              textField({
                autocomplete: 'address-level2',
                key: 'poststed1',
                label: 'Poststed',
              }),
              textField({
                key: 'region',
                label: 'Region',
              }),
              countrySelect({
                key: 'land',
                label: 'Land',
              }),
              container({
                hideLabel: true,
                key: 'sendtUtOgLonnetAvUtenlandskVirksomhet',
                label: 'Lønnet av utenlandsk virksomhet',
                components: [
                  number({
                    description: 'Oppgi 0 hvis ingen norsk eierandel',
                    key: 'oppgiNorskEierandel',
                    label: 'Oppgi norsk eierandel i prosent',
                  }),
                  textArea({
                    key: 'beskrivDenUtenlandskeVirksomhetensTilknytningTilNorskeNaeringsinteresser',
                    label: 'Beskriv den utenlandske virksomhetens tilknytning til norske næringsinteresser',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      panel({
        key: 'selvstendigNaeringsdrivende',
        title: 'Selvstendig næringsdrivende',
        components: [
          container({
            conditional: {
              show: true,
              when: 'hvaErDinArbeidssituasjonIPerioden',
              eq: '',
            },
            hideLabel: true,
            key: 'selvstendigNaeringsdrivende2',
            label: 'Selvstendig næringsdrivende',
            components: [
              textField({
                key: 'oppgiNavnPaVirksomhetenDuJobberFor',
                label: 'Oppgi navn på virksomheten du jobber for',
              }),
              organizationNumber({
                key: 'oppgiOrganisasjonsnummer',
                label: 'Oppgi organisasjonsnummeret',
                validate: {
                  custom: 'valid = instance.validateOrganizationNumber(input)',
                },
              }),
              textArea({
                key: 'hvaSlagsArbeidUtforerDuIUtlandet',
                label: 'Hva slags arbeid utfører du i utlandet? ',
              }),
            ],
          }),
        ],
      }),
      panel({
        key: 'student',
        title: 'Student',
        components: [
          radio({
            key: 'hvorSkalDuStudere',
            label: 'Hvor skal du  studere?',
            values: [
              { label: 'Ved et lærested', value: 'vedEtLaerested' },
              { label: 'Jeg skal følge nettstudier', value: 'jegSkalFolgeNettstudier' },
            ],
          }),
          textArea({
            conditional: {
              show: true,
              when: 'hvorSkalDuStudere',
              eq: 'jegSkalFolgeNettstudier',
            },
            key: 'hvorforSkalDuOppholdeDegIUtlandetMensDuStuderer',
            label: 'Hvorfor skal du oppholde  deg i utlandet mens du  studerer?',
          }),
          container({
            hideLabel: true,
            key: 'laerested',
            label: 'Lærested',
            components: [
              textField({
                key: 'laerestedetsNavn',
                label: 'Lærestedets navn',
              }),
              textField({
                autocomplete: 'street-address',
                key: 'adresse',
                label: 'Adresse',
              }),
              textField({
                key: 'postnummer',
                label: 'Postnummer',
              }),
              textField({
                autocomplete: 'address-level2',
                key: 'poststed',
                label: 'Poststed',
              }),
              textField({
                key: 'region',
                label: 'Region',
              }),
              countrySelect({
                key: 'land',
                label: 'Land',
              }),
            ],
          }),
          textField({
            key: 'hvilkenUtdanningTarDu',
            label: 'Hvilken utdanning tar du?',
          }),
          datePicker({
            key: 'narForventerDuAAvslutteDenDatoDdMmAaaa',
            label: 'Når forventer du å  avslutte utdanningen? (dd.mm.åååå)',
            validate: {
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
          selectBoxes({
            key: 'hvordanFinansiererDuStudiene',
            label: 'Hvordan finansierer du studiene?',
            values: [
              { label: 'Støtte fra Lånekassen', value: 'stotteFraLanekassen' },
              { label: 'Lån/stipend fra annen institusjon', value: 'lanStipendFraAnnenInstitusjon' },
              {
                label: 'Privat finansiering (f.eks. sparepenger eller banklån) ',
                value: 'privatFinansieringFEksSparepengerEllerBanklan',
              },
              { label: 'Arbeidsinntekt', value: 'arbeidsinntekt' },
              { label: 'Annet', value: 'annet' },
            ],
          }),
          textArea({
            customConditional: `show=
(data.hvordanFinansiererDuStudiene.privatFinansieringFEksSparepengerEllerBanklan === true) ||
(data.hvordanFinansiererDuStudiene.annet === true);`,
            key: 'beskrivHvordanDuFinansiererStudiene',
            label: 'Beskriv hvordan du finansierer studiene',
          }),
          radio({
            customConditional: `show=
(data.hvordanFinansiererDuStudiene.privatFinansieringFEksSparepengerEllerBanklan === true);`,
            key: 'finansieresStudieneFraNorge',
            label: 'Finansieres studiene fra Norge?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          textField({
            conditional: {
              show: true,
              when: 'hvordanFinansiererDuStudiene',
              eq: 'lanStipendFraAnnenInstitusjon',
            },
            key: 'navnPaInstitusjon',
            label: 'Navn på institusjon',
          }),
          countrySelect({
            customConditional: `show=
(data.finansieresStudieneFraNorge === "nei") ||
(data.hvordanFinansiererDuStudiene.lanStipendFraAnnenInstitusjon === true);`,
            key: 'land',
            label: 'Land',
          }),
        ],
      }),
      panel({
        key: 'auPairPraktikantEllerArbeidVedSidenAvStudier',
        title: 'Au pair/praktikant eller arbeid ved siden av studier',
        components: [
          container({
            hideLabel: true,
            key: 'auPairPraktikantEllerArbeidVedSidenAvStudier2',
            label: 'Au pair/praktikant eller arbeid ved siden av studier',
            components: [
              htmlElement({
                content: '<b>Hvem arbeider du for?</b>',
                key: 'html',
              }),
              textField({
                key: 'navnPaVirksomhet',
                label: 'Navn på arbeidsgiver',
              }),
              number({
                key: 'virksomhetsnrRegistreringsnr',
                label: 'Organisasjonsnummer/registreringsnummer',
              }),
              textField({
                key: 'adresse',
                label: 'Adresse',
              }),
              textField({
                key: 'postnummer',
                label: 'Postnummer',
              }),
              textField({
                autocomplete: 'address-level2',
                key: 'poststed',
                label: 'Poststed',
              }),
              textField({
                key: 'region',
                label: 'Region',
              }),
              countrySelect({
                key: 'land',
                label: 'Land',
              }),
              radio({
                key: 'iHvilkenVirksomhetSkalArbeidetUtfores',
                label: 'Hvor skal arbeidet utføres?',
                values: [
                  { label: 'På adressen oppgitt over', value: 'hosArbeidsgiver' },
                  { label: 'På en annen adresse', value: 'iAnnenVirksomhet' },
                ],
              }),
            ],
          }),
          container({
            customConditional: `show=
(data.auPairPraktikantEllerArbeidVedSidenAvStudier2.iHvilkenVirksomhetSkalArbeidetUtfores === "iAnnenVirksomhet");`,
            hideLabel: true,
            key: 'virksomhetHvorArbeidetUtfores',
            label: 'Virksomhet hvor arbeidet utføres',
            components: [
              textField({
                key: 'virksomhetensNavn',
                label: 'Navn på arbeidsgiver/arbeidssted',
              }),
              textField({
                key: 'adresse',
                label: 'Adresse',
              }),
              textField({
                key: 'postnummer',
                label: 'Postnummer',
              }),
              textField({
                autocomplete: 'address-level2',
                key: 'poststed1',
                label: 'Poststed',
              }),
              textField({
                key: 'region',
                label: 'Region',
              }),
              countrySelect({
                key: 'land',
                label: 'Land',
              }),
            ],
          }),
        ],
      }),
      panel({
        key: 'annenArbeidssituasjon',
        title: 'Annen arbeidssituasjon',
        components: [
          textArea({
            key: 'beskrivArbeidssituasjonenDin',
            label: 'Beskriv  arbeidssituasjonen din',
          }),
          dataGrid({
            addAnother: 'Legg til virksomhet',
            key: 'virksomheterDuArbeiderFor',
            label: 'Virksomheter du arbeider for',
            components: [
              textField({
                key: 'navnPaVirksomhet',
                label: 'Navn på virksomhet',
              }),
              number({
                key: 'virksomhetsnrRegistreringsnr',
                label: 'Organisasjonsnummer/registreringsnummer',
              }),
              textField({
                key: 'adresse',
                label: 'Adresse',
              }),
              textField({
                key: 'postnummer',
                label: 'Postnummer',
              }),
              textField({
                autocomplete: 'address-level2',
                key: 'poststed',
                label: 'Poststed',
              }),
              textField({
                key: 'region',
                label: 'Region',
              }),
              countrySelect({
                key: 'land',
                label: 'Land',
              }),
              radio({
                key: 'iHvilkenVirksomhetSkalArbeidetUtfores',
                label: 'Hvor skal du utføre arbeidet?',
                values: [
                  { label: 'På samme adresse som over', value: 'iVirksomhetenSomErBeskrevetOvenfor' },
                  { label: 'På annen adresse/sted', value: 'iAnnenVirksomhet' },
                ],
              }),
              textField({
                conditional: {
                  show: true,
                  when: 'virksomheterDuArbeiderFor.iHvilkenVirksomhetSkalArbeidetUtfores',
                  eq: 'iAnnenVirksomhet',
                },
                key: 'virksomhetensNavn',
                label: 'Virksomhetens navn',
              }),
              checkbox({
                conditional: {
                  show: true,
                  when: 'virksomheterDuArbeiderFor.iHvilkenVirksomhetSkalArbeidetUtfores',
                  eq: 'iAnnenVirksomhet',
                },
                defaultValue: false,
                key: 'jegJobberIkkePaEnFastAdresse',
                label: 'Jeg jobber ikke på en fast adresse',
              }),
              container({
                conditional: {
                  show: true,
                  when: 'virksomheterDuArbeiderFor.jegJobberIkkePaEnFastAdresse',
                  eq: 'false',
                },
                hideLabel: true,
                key: 'virksomhetensAdresse',
                label: 'Virksomhetens adresse',
                components: [
                  textField({
                    key: 'adresse1',
                    label: 'Adresse',
                  }),
                  textField({
                    key: 'postnummer1',
                    label: 'Postnummer',
                  }),
                  textField({
                    autocomplete: 'address-level2',
                    key: 'poststed1',
                    label: 'Poststed',
                  }),
                  textField({
                    key: 'region1',
                    label: 'Region',
                  }),
                  countrySelect({
                    key: 'land1',
                    label: 'Land',
                  }),
                ],
              }),
              textArea({
                conditional: {
                  show: true,
                  when: 'virksomheterDuArbeiderFor.jegJobberIkkePaEnFastAdresse',
                  eq: true,
                },
                key: 'beskrivHvorDuSkalArbeide',
                label: 'Beskriv hvor du skal arbeide',
              }),
            ],
          }),
        ],
      }),
      panel({
        key: 'hvorUtforesArbeidet',
        title: 'Hvor utføres arbeidet',
        components: [
          dataGrid({
            addAnother: 'Legg til nytt sted',
            key: 'arbeidssteder',
            label: 'Arbeidssteder',
            components: [
              radio({
                key: 'hvorSkalDuUtforeArbeidet',
                label: 'Hvor skal du  utføre  arbeidet?',
                values: [
                  { label: 'På land', value: 'paLand' },
                  { label: 'Offshore', value: 'offshore' },
                  { label: 'På skip', value: 'paSkip' },
                  { label: 'Om bord på fly', value: 'omBordPaFly' },
                ],
              }),
              formGroup({
                conditional: {
                  show: true,
                  when: 'arbeidssteder.hvorSkalDuUtforeArbeidet',
                  eq: 'paLand',
                },
                key: 'navSkjemagruppe1',
                label: 'Skjemagruppe',
                legend: 'På land',
                components: [
                  textField({
                    key: 'firmanavn',
                    label: 'Navn på virksomhet/arbeidssted',
                  }),
                  textField({
                    key: 'adresse',
                    label: 'Adresse',
                  }),
                  textField({
                    key: 'postnummer1',
                    label: 'Postnummer',
                  }),
                  textField({
                    autocomplete: 'address-level2',
                    key: 'poststed',
                    label: 'Poststed',
                  }),
                  textField({
                    key: 'region',
                    label: 'Region',
                  }),
                  countrySelect({
                    key: 'land',
                    label: 'Land',
                  }),
                  radio({
                    key: 'skalDuJobbeUtelukkendePaHjemmekontor',
                    label: 'Skal du arbeide på  hjemmekontor?',
                    values: [
                      { label: 'Ja', value: 'ja' },
                      { label: 'Nei', value: 'nei' },
                    ],
                  }),
                  textArea({
                    conditional: {
                      show: true,
                      when: 'arbeidssteder.skalDuJobbeUtelukkendePaHjemmekontor',
                      eq: 'ja',
                    },
                    key: 'beskrivArsakenTilHjemmekontor',
                    label: 'Hvorfor skal du arbeide på hjemmekontor?',
                  }),
                  radio({
                    key: 'arbeiderDuIEnRotasjonsordning',
                    label: 'Arbeider du i en  rotasjonsordning?',
                    values: [
                      { label: 'Ja', value: 'ja' },
                      { label: 'Nei', value: 'nei' },
                    ],
                  }),
                ],
              }),
              formGroup({
                conditional: {
                  show: true,
                  when: 'arbeidssteder.hvorSkalDuUtforeArbeidet',
                  eq: 'offshore',
                },
                key: 'navSkjemagruppe2',
                label: 'Skjemagruppe',
                legend: 'Offshore',
                components: [
                  textField({
                    key: 'navnPaInnretningen',
                    label: 'Navn på innretningen',
                  }),
                  countrySelect({
                    key: 'hvilketLandsSokkel',
                    label: 'Hvilket lands sokkel',
                  }),
                  select({
                    key: 'typeInnretning',
                    label: 'Type innretning',
                    values: [
                      { label: 'Plattform eller annen fast  innretning', value: 'plattformEllerAnnenFastInnretning' },
                      { label: ' Boreskip eller  annen flyttbar enhet', value: 'boreskipEllerAnnenFlyttbarEnhet' },
                    ],
                    widget: 'choicesjs',
                  }),
                  radio({
                    key: 'arbeiderDuIEnRotasjonsordning1',
                    label: 'Arbeider du i en  rotasjonsordning?',
                    values: [
                      { label: 'Ja', value: 'ja' },
                      { label: 'Nei', value: 'nei' },
                    ],
                  }),
                ],
              }),
              formGroup({
                conditional: {
                  show: true,
                  when: 'arbeidssteder.hvorSkalDuUtforeArbeidet',
                  eq: 'paSkip',
                },
                key: 'navSkjemagruppe3',
                label: 'Skjemagruppe',
                legend: 'På skip',
                components: [
                  textField({
                    key: 'beskrivArbeismonsteret',
                    label: 'Navn på skip',
                  }),
                  countrySelect({
                    key: 'flaggland',
                    label: 'Flaggland',
                  }),
                  radio({
                    key: 'hvorOppholderDuDegIFriperiodeneNarDuIkkeArbeider1',
                    label: 'Hvor oppholder  du deg  når  du ikke  arbeider?',
                    values: [
                      { label: 'I Norge mer enn halvparten av tiden', value: 'iNorgeMerEnnHalvpartenAvTiden' },
                      { label: 'I andre land mer enn halvparten av tiden', value: 'iAndreLandMerEnnHalvpartenAvTiden' },
                    ],
                  }),
                  textArea({
                    conditional: {
                      show: true,
                      when: 'arbeidssteder.hvorOppholderDuDegIFriperiodeneNarDuIkkeArbeider1',
                      eq: 'iAndreLandMerEnnHalvpartenAvTiden',
                    },
                    key: 'beskrivHvorX',
                    label: 'Beskriv hvor',
                  }),
                ],
              }),
              formGroup({
                conditional: {
                  show: true,
                  when: 'arbeidssteder.hvorSkalDuUtforeArbeidet',
                  eq: 'omBordPaFly',
                },
                key: 'navSkjemagruppe4',
                label: 'Skjemagruppe',
                legend: 'Om bord på fly',
                components: [
                  textField({
                    key: 'navnPaHjemmebasen',
                    label: 'Navn på hjemmebasen',
                  }),
                  countrySelect({
                    key: 'landDerHjemmebasenLigger',
                    label: 'Land der hjemmebasen ligger',
                  }),
                  select({
                    key: 'typeFlygninger',
                    label: 'Type flygninger',
                    values: [
                      { label: 'Nasjonale', value: 'nasjonale' },
                      { label: 'Internasjonale', value: 'internasjonale' },
                      { label: 'Begge', value: 'begge' },
                    ],
                    widget: 'choicesjs',
                  }),
                ],
              }),
              formGroup({
                customConditional: `show=
(row.arbeiderDuIEnRotasjonsordning1 === "ja") ||
(row.arbeiderDuIEnRotasjonsordning === "ja");`,
                key: 'navSkjemagruppe',
                label: 'Skjemagruppe',
                legend: 'Rotasjonsordning',
                components: [
                  textArea({
                    key: 'beskrivArbeidsmonsteret',
                    label: 'Beskriv arbeidsmønsteret',
                  }),
                  radio({
                    conditional: {
                      show: true,
                      when: 'arbeidssteder.paSkip.hvorOppholderDuDegIFriperiodeneNarDuIkkeArbeider1',
                      eq: '',
                    },
                    key: 'hvorOppholderDuDegIFriperiodeneNarDuIkkeArbeider',
                    label: 'Hvor oppholder du deg når du ikke arbeider?',
                    values: [
                      { label: 'I Norge mer enn halvparten av tiden', value: 'iNorgeMerEnnHalvpartenAvTiden' },
                      { label: 'I andre land mer enn halvparten av tiden', value: 'iAndreLandMerEnnHalvpartenAvTiden' },
                    ],
                  }),
                  textArea({
                    conditional: {
                      show: true,
                      when: 'arbeidssteder.hvorOppholderDuDegIFriperiodeneNarDuIkkeArbeider',
                      eq: 'iAndreLandMerEnnHalvpartenAvTiden',
                    },
                    key: 'beskrivHvorDu1',
                    label: 'Beskriv hvor',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      panel({
        key: 'skatteforholdOgInntekt',
        title: 'Skatteforhold og inntekt',
        components: [
          radio({
            key: 'betalerDuSkattTilNorge',
            label: 'Betaler du  skatt til Norge?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          selectBoxes({
            key: 'hvilkenVirksomhetFarDuInntektenFra',
            label: 'Hvilken virksomhet får du inntekten fra?',
            values: [
              { label: 'Norsk virksomhet', value: 'norskVirksomhet' },
              { label: 'Utenlandsk virksomhet', value: 'utenlandskVirksomhet' },
            ],
          }),
          container({
            conditional: {
              show: true,
              when: 'hvilkenVirksomhetFarDuInntektenFra',
              eq: 'norskVirksomhet',
            },
            key: 'norskVirksomhet',
            label: 'Norsk virksomhet',
            components: [
              selectBoxes({
                key: 'hvaMottarDu',
                label: 'Hva mottar du?',
                values: [
                  { label: 'Lønn', value: 'lonn' },
                  { label: 'Stipend', value: 'stipend' },
                ],
              }),
              container({
                conditional: {
                  show: true,
                  when: 'norskVirksomhet.hvaMottarDu',
                  eq: 'lonn',
                },
                key: 'lonn',
                label: 'Lønn, norsk virksomhet',
                components: [
                  currency({
                    key: 'angiSum',
                    label: 'Angi sum',
                  }),
                  radio({
                    key: 'mottarDuUtenlandstillegg',
                    label: 'Mottar du  utenlandstillegg?',
                    values: [
                      { label: 'Ja', value: 'ja' },
                      { label: 'Nei', value: 'nei' },
                    ],
                  }),
                  currency({
                    conditional: {
                      show: true,
                      when: 'norskVirksomhet.lonn.mottarDuUtenlandstillegg',
                      eq: 'ja',
                    },
                    key: 'angiSumUtenlandstillegg',
                    label: 'Angi sum utenlandstillegg',
                  }),
                  radio({
                    key: 'mottarDuNaturalytelser',
                    label: 'Mottar du  naturalytelser?',
                    values: [
                      { label: 'Ja', value: 'ja' },
                      { label: 'Nei', value: 'nei' },
                    ],
                  }),
                  container({
                    conditional: {
                      show: true,
                      when: 'norskVirksomhet.lonn.mottarDuNaturalytelser',
                      eq: 'ja',
                    },
                    hideLabel: true,
                    key: 'naturalytelser',
                    label: 'Naturalytelser',
                    components: [
                      selectBoxes({
                        key: 'hvilkeNaturalytelserMottarDu',
                        label: 'Hvilke naturalytelser mottar du?',
                        values: [
                          { label: 'Bolig', value: 'bolig' },
                          { label: 'Bil', value: 'bil' },
                          { label: 'Andre naturalytelser', value: 'andreNaturalytelser' },
                        ],
                      }),
                      currency({
                        customConditional:
                          'show = (data.norskVirksomhet.lonn.naturalytelser.hvilkeNaturalytelserMottarDu.bolig === true);',
                        key: 'friBoligVerdi',
                        label: 'Oppgi verdi for bolig',
                      }),
                      currency({
                        customConditional:
                          'show = (data.norskVirksomhet.lonn.naturalytelser.hvilkeNaturalytelserMottarDu.bil === true);',
                        key: 'friBilVerdi',
                        label: 'Oppgi verdi for bil',
                      }),
                      textArea({
                        customConditional:
                          'show = (data.norskVirksomhet.lonn.naturalytelser.hvilkeNaturalytelserMottarDu.andreNaturalytelser === true);',
                        key: 'beskrivelseAndreNaturalytelser',
                        label: 'Oppgi andre naturalytelser og samlet verdi',
                      }),
                    ],
                  }),
                ],
              }),
              container({
                conditional: {
                  show: true,
                  when: 'norskVirksomhet.hvaMottarDu',
                  eq: 'stipend',
                },
                key: 'stipend',
                label: 'Stipend, norsk virksomhet',
                components: [
                  textField({
                    key: 'hvemUtbetalerStipendet',
                    label: 'Hvem utbetaler stipendet?',
                  }),
                  currency({
                    key: 'angiSum',
                    label: 'Angi sum',
                  }),
                ],
              }),
            ],
          }),
          container({
            conditional: {
              show: true,
              when: 'hvilkenVirksomhetFarDuInntektenFra',
              eq: 'utenlandskVirksomhet',
            },
            key: 'utenlandskVirksomhet1',
            label: 'Utenlandsk virksomhet',
            components: [
              selectBoxes({
                key: 'hvaMottarDu1',
                label: 'Hva mottar du?',
                values: [
                  { label: 'Lønn', value: 'lonn' },
                  { label: 'Stipend', value: 'stipend' },
                ],
              }),
              container({
                conditional: {
                  show: true,
                  when: 'utenlandskVirksomhet1.hvaMottarDu1',
                  eq: 'lonn',
                },
                key: 'lonn',
                label: 'Lønn, utenlandsk virksomhet',
                components: [
                  currency({
                    key: 'angiSum',
                    label: 'Angi sum',
                  }),
                  radio({
                    key: 'mottarDuUtenlandstillegg',
                    label: 'Mottar du  utenlandstillegg?',
                    values: [
                      { label: 'Ja', value: 'ja' },
                      { label: 'Nei', value: 'nei' },
                    ],
                  }),
                  currency({
                    conditional: {
                      show: true,
                      when: 'utenlandskVirksomhet1.lonn.mottarDuUtenlandstillegg',
                      eq: 'ja',
                    },
                    key: 'angiSumUtenlandstillegg',
                    label: 'Angi sum utenlandstillegg',
                  }),
                  radio({
                    key: 'mottarDuNaturalytelser',
                    label: 'Mottar du  naturalytelser?',
                    values: [
                      { label: 'Ja', value: 'ja' },
                      { label: 'Nei', value: 'nei' },
                    ],
                  }),
                  container({
                    conditional: {
                      show: true,
                      when: 'utenlandskVirksomhet1.lonn.mottarDuNaturalytelser',
                      eq: 'ja',
                    },
                    hideLabel: true,
                    key: 'naturalytelser',
                    label: 'Naturalytelser',
                    components: [
                      selectBoxes({
                        key: 'hvilkeNaturalytelserMottarDu',
                        label: 'Hvilke naturalytelser mottar du?',
                        values: [
                          { label: 'Bolig', value: 'bolig' },
                          { label: 'Bil', value: 'bil' },
                          { label: 'Andre naturalytelser', value: 'andreNaturalytelser' },
                        ],
                      }),
                      currency({
                        customConditional:
                          'show = (data.utenlandskVirksomhet1.lonn.naturalytelser.hvilkeNaturalytelserMottarDu.bolig === true);',
                        key: 'friBoligVerdi',
                        label: 'Oppgi verdi for bolig',
                      }),
                      currency({
                        customConditional:
                          'show = (data.utenlandskVirksomhet1.lonn.naturalytelser.hvilkeNaturalytelserMottarDu.bil === true);',
                        key: 'friBilVerdi',
                        label: 'Oppgi verdi for bil',
                      }),
                      textArea({
                        customConditional:
                          'show = (data.utenlandskVirksomhet1.lonn.naturalytelser.hvilkeNaturalytelserMottarDu.andreNaturalytelser === true);',
                        key: 'beskrivelseAndreNaturalytelser',
                        label: 'Oppgi andre naturalytelser og samlet verdi',
                      }),
                    ],
                  }),
                ],
              }),
              container({
                conditional: {
                  show: true,
                  when: 'utenlandskVirksomhet1.hvaMottarDu1',
                  eq: 'stipend',
                },
                key: 'stipend',
                label: 'Stipend, utenlandsk virksomhet',
                components: [
                  textField({
                    key: 'hvemUtbetalerStipendet',
                    label: 'Hvem utbetaler stipendet?',
                  }),
                  currency({
                    key: 'angiSum',
                    label: 'Angi sum',
                  }),
                ],
              }),
            ],
          }),
          radio({
            key: 'mottarDuITilleggPensjonOffentligeEllerPrivate',
            label: 'Mottar du pensjon (offentlig eller privat)?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          radio({
            conditional: {
              show: true,
              when: 'mottarDuITilleggPensjonOffentligeEllerPrivate',
              eq: 'ja',
            },
            key: 'farDuPensjonFraUtlandet',
            label: 'Mottar du pensjon  fra utlandet?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          dataGrid({
            addAnother: 'Legg til pensjon',
            conditional: {
              show: true,
              when: 'farDuPensjonFraUtlandet',
              eq: 'ja',
            },
            description: 'Her kan du legge inn pensjon fra flere land',
            key: 'pensjonFraUtlandet',
            label: 'Pensjon fra utlandet',
            components: [
              countrySelect({
                key: 'landDuMottarPensjonFra',
                label: 'Land du mottar pensjon fra',
              }),
              currency({
                key: 'pensjon',
                label: 'Pensjon',
              }),
            ],
          }),
          radio({
            key: 'harDuAndreArbeidsinntekter',
            label: 'Har du andre arbeidsinntekter?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          container({
            conditional: {
              show: true,
              when: 'harDuAndreArbeidsinntekter',
              eq: 'ja',
            },
            key: 'andreArbeidsinntekter',
            label: 'Andre arbeidsinntekter',
            components: [
              textArea({
                key: 'beskrivelseAvInntekt',
                label: 'Beskriv de andre arbeidsinntektene',
              }),
              currency({
                key: 'angiBelop',
                label: 'Angi beløp',
              }),
            ],
          }),
        ],
      }),
      panel({
        key: 'pensjonEllerUforetrygd',
        title: 'Pensjon eller uføretrygd',
        components: [
          radio({
            key: 'mottarDuPensjonFraNav',
            label: 'Mottar du pensjon eller uføretrygd fra NAV?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          radio({
            conditional: {
              show: true,
              when: 'mottarDuPensjonFraNav',
              eq: 'ja',
            },
            key: 'mottarDuITilleggPensjonFraAndreOrdningerOffentligePrivateEllerUtenlandske',
            label:
              'Mottar du i tillegg pensjon eller uføretrygd fra andre ordninger (offentlige, private eller utenlandske)?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          dataGrid({
            addAnother: 'Legg til pensjon eller uføretrygd',
            conditional: {
              show: true,
              when: 'mottarDuPensjonEllerUforetrygdFraAndreOrdningerOffentligePrivateEllerUtenlandske',
              eq: 'ja',
            },
            customConditional: `show=
(data.mottarDuPensjonFraNav === "nei") ||
(data.mottarDuITilleggPensjonFraAndreOrdningerOffentligePrivateEllerUtenlandske === "ja");`,
            description: 'Hvem mottar du pensjon eller uføretrygd fra?',
            key: 'pensjoner',
            label: 'Pensjon eller uføretrygd',
            components: [
              textField({
                key: 'selskapPensjonsordning',
                label: 'Navn på selskap/pensjonsordning (offentlig, privat eller utenlandsk)',
              }),
              currency({
                key: 'belop',
                label: 'Beløp',
              }),
            ],
          }),
          radio({
            key: 'erDuSkattepliktigTilNorge',
            label: 'Betaler du skatt til Norge?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          radio({
            conditional: {
              show: true,
              when: 'mottarDuPensjonFraNav',
              eq: 'nei',
            },
            key: 'betalerDuKildeskattTilNorge',
            label: 'Betaler du kildeskatt til Norge?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
        ],
      }),
      panel({
        key: 'representantINorge',
        title: 'Trygdeavgift til NAV',
        components: [
          alert({
            content: `<p>I noen tilfeller skal du betale trygdeavgift til NAV. Dette gjelder for eksempel hvis du ikke betaler skatt til Norge eller mottar lønn fra utlandet.</p>
<p>Hvis du skal betale trygdeavgift til NAV, sender vi fakturaen til deg. Du kan velge at noen andre skal motta og betale fakturaen for deg, for eksempel arbeidsgiveren din
eller en annen person.</p>`,
            key: 'alertstripe3',
          }),
          radio({
            key: 'onskerDuAtNoenAndreSkalMottaOgBetaleFakturaForTrygdeavgiftForDeg',
            label: 'Ønsker du at noen andre skal motta og betale faktura for trygdeavgift for deg?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          alert({
            content: `<p>Du må legge ved en fullmakt for faktura. I fullmakten må det stå</p>
<ul>
  <li>hvem som gir fullmakten</li>
  <li>hvem som får fullmakten</li>
  <li>for hvilken periode fullmakten gjelder</li>
  <li>at fullmakten gjelder mottak og betaling av faktura for trygdeavgift</li>
</ul>`,
            customConditional: `show = (data.fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv === "ja") &&
       (data.onskerDuAtNoenAndreSkalMottaOgBetaleFakturaForTrygdeavgiftForDeg === "ja");`,
            key: 'alertstripe6',
          }),
          radio({
            conditional: {
              show: true,
              when: 'onskerDuAtNoenAndreSkalMottaOgBetaleFakturaForTrygdeavgiftForDeg',
              eq: 'ja',
            },
            key: 'hvordanSkalDuRepresenteresINorge',
            label: 'Hvem skal motta faktura for deg?',
            values: [
              { label: 'En privatperson', value: 'avEnPerson' },
              { label: 'En virksomhet eller arbeidsgiver', value: 'avEnVirksomhet' },
            ],
          }),
          container({
            conditional: {
              show: true,
              when: 'hvordanSkalDuRepresenteresINorge',
              eq: 'avEnPerson',
            },
            hideLabel: true,
            key: 'representersAvEnPerson',
            label: 'Representeres av en person',
            components: [
              textField({
                autocomplete: 'given-name',
                key: 'fornavn',
                label: 'Fornavn',
              }),
              textField({
                autocomplete: 'family-name',
                key: 'etternavn1',
                label: 'Etternavn',
              }),
              nationalIdentityNumber({
                key: 'fodselsnummerDNummer',
                label: 'Fødselsnummer eller d-nummer',
                validate: {
                  custom: 'valid = instance.validateFnrNew(input)',
                },
              }),
            ],
          }),
          container({
            conditional: {
              show: true,
              when: 'hvordanSkalDuRepresenteresINorge',
              eq: 'avEnVirksomhet',
            },
            hideLabel: true,
            key: 'representeresAvEnVirksomhet',
            label: 'Representeres av en virksomhet',
            components: [
              textField({
                key: 'virksomhetensNavn1',
                label: 'Virksomhetens navn',
              }),
              organizationNumber({
                conditional: {
                  show: false,
                  when: 'representeresAvEnVirksomhet.jegVetIkkeHvaVirksomhetsnummeretEr',
                  eq: true,
                },
                key: 'orgNr',
                label: 'Organisasjonsnummer til underenheten som skal motta faktura',
                validate: {
                  custom: 'valid = instance.validateOrganizationNumber(input)',
                },
              }),
              alert({
                conditional: {
                  show: false,
                  when: 'representeresAvEnVirksomhet.jegVetIkkeHvaVirksomhetsnummeretEr',
                  eq: true,
                },
                content: `Alle virksomheter består av en hovedenhet og en eller flere underenheter. Både hovedenhet og
underenheten har egne organisasjonsnumre. <br><br>


Organisasjonsnummeret har ni siffer. Hvis du har navn eller organisasjonsnummeret til
hovedenheten, kan du finne informasjon om underenheter på Brønnøysundregistrenes
hjemmeside.`,
                key: 'alertstripe',
              }),
              checkbox({
                defaultValue: false,
                key: 'jegVetIkkeHvaVirksomhetsnummeretEr',
                label: 'Jeg vet ikke hva organisasjonsnummeret er',
              }),
              container({
                conditional: {
                  show: true,
                  when: 'representeresAvEnVirksomhet.jegVetIkkeHvaVirksomhetsnummeretEr',
                  eq: true,
                },
                key: 'container',
                label: 'Adresseopplysninger for virksomheten',
                components: [
                  textField({
                    autocomplete: 'street-address',
                    key: 'adresse',
                    label: 'Adresse',
                  }),
                  textField({
                    autocomplete: 'postal-code',
                    key: 'postnr',
                    label: 'Postnummer',
                  }),
                  textField({
                    autocomplete: 'address-level2',
                    key: 'poststed',
                    label: 'Poststed',
                  }),
                ],
              }),
              textField({
                key: 'kontaktperson',
                label: 'Kontaktperson',
              }),
              phoneNumber({
                key: 'telefonnummerKontaktperson',
                label: 'Telefonnummer kontaktperson',
              }),
            ],
          }),
          radio({
            conditional: {
              show: true,
              when: 'hvordanSkalDuRepresenteresINorge',
              eq: 'avEnPerson',
            },
            key: 'forHvilkenPeriodeSkalDennePersonenMottaOgBetaleFakturaForDeg',
            label: 'For hvilken periode skal denne personen motta og betale faktura for deg?',
            values: [
              { label: 'For perioden søknaden gjelder', value: 'forPeriodenSoknadenGjelder' },
              { label: 'For en annen periode', value: 'forEnAnnenPeriode' },
            ],
          }),
          radio({
            conditional: {
              show: true,
              when: 'hvordanSkalDuRepresenteresINorge',
              eq: 'avEnVirksomhet',
            },
            key: 'forHvilkenPeriodeSkalDenneVirksomhetenMottaOgBetaleFakturaForDeg',
            label: 'For hvilken periode skal denne virksomheten motta og betale faktura for deg?',
            values: [
              { label: 'For perioden søknaden gjelder', value: 'forPeriodenSoknadenGjelder' },
              { label: 'For en annen periode', value: 'forEnAnnenPeriode' },
            ],
          }),
          datePicker({
            customConditional: `show = (data.forHvilkenPeriodeSkalDennePersonenMottaOgBetaleFakturaForDeg === "forEnAnnenPeriode") ||
       (data.forHvilkenPeriodeSkalDenneVirksomhetenMottaOgBetaleFakturaForDeg === "forEnAnnenPeriode");`,
            key: 'fraOgMedDatoDdMmAaaa',
            label: 'Fra og med dato (dd.mm.åååå)',
            validate: {
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
          datePicker({
            customConditional: `show = (data.forHvilkenPeriodeSkalDennePersonenMottaOgBetaleFakturaForDeg === "forEnAnnenPeriode") ||
       (data.forHvilkenPeriodeSkalDenneVirksomhetenMottaOgBetaleFakturaForDeg === "forEnAnnenPeriode");`,
            key: 'tilOgMedDatoDdMmAaaa',
            label: 'Til og med dato (dd.mm.åååå)',
            validate: {
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
        ],
      }),
      panel({
        key: 'folgerMedEtFamiliemedlem',
        title: 'Følger med et familiemedlem',
        components: [
          htmlElement({
            content: '<h3>Opplysninger om den du reiser med</h3>',
            key: 'html',
          }),
          textField({
            autocomplete: 'given-name',
            key: 'fornavn',
            label: 'Fornavn',
          }),
          textField({
            autocomplete: 'family-name',
            key: 'etternavn',
            label: 'Etternavn',
          }),
          nationalIdentityNumber({
            key: 'fodselsnummerDNummer',
            label: 'Fødselsnummer/d-nummer',
            validate: {
              custom: 'valid = instance.validateFnrNew(input)',
            },
          }),
        ],
      }),
      panel({
        key: 'annenSituasjon',
        title: 'Annen situasjon',
        components: [
          textArea({
            key: 'spesifiserDinSituasjonIUtlandet',
            label: 'Beskriv hva du skal gjøre',
          }),
        ],
      }),
      panel({
        key: 'familiemedlemmer',
        title: 'Familiemedlemmer',
        components: [
          radio({
            key: 'sokerDuForBarnUnder18ArSomSkalVaereMedTilUtlandet',
            label: 'Søker du for  barn under 18 år  som skal være  med til utlandet?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          alert({
            content: `Ektefelle/partner/samboer og barn over 18 år må sende inn egen søknad.<br>
Har du barn under 18 år med egen inntekt, må du sende inn egen søknad for barnet.`,
            key: 'alertstripe4',
          }),
          dataGrid({
            addAnother: 'Legg til barn under 18 år',
            conditional: {
              show: true,
              when: 'sokerDuForBarnUnder18ArSomSkalVaereMedTilUtlandet',
              eq: 'ja',
            },
            key: 'barnUnder18ArSomSkalVaereMedTilUtlandet',
            label: 'Barn under 18 år som skal være med til utlandet',
            components: [
              textField({
                autocomplete: 'given-name',
                key: 'fornavn',
                label: 'Fornavn',
              }),
              textField({
                autocomplete: 'family-name',
                key: 'etternavn',
                label: 'Etternavn',
              }),
              nationalIdentityNumber({
                conditional: {
                  show: true,
                  when: 'barnUnder18ArSomSkalVaereMedTilUtlandet.barnetHarIkkeNorskFodselsnummerDNummer',
                  eq: 'false',
                },
                key: 'fodselsnummerDNummer',
                label: 'Fødselsnummer/d-nummer',
                validate: {
                  custom: 'valid = instance.validateFnrNew(input)',
                },
              }),
              checkbox({
                defaultValue: false,
                key: 'barnetHarIkkeNorskFodselsnummerDNummer',
                label: 'Barnet har ikke norsk fødselsnummer/d-nummer',
              }),
              datePicker({
                conditional: {
                  show: true,
                  when: 'barnUnder18ArSomSkalVaereMedTilUtlandet.barnetHarIkkeNorskFodselsnummerDNummer',
                  eq: true,
                },
                key: 'fodselsdatoDdMmAaaa',
                label: 'Fødselsdato (dd.mm.åååå)',
                validate: {
                  custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                },
              }),
            ],
          }),
          radio({
            key: 'harDuEktefellePartnerSamboerSomOgsaSkalTilUtlandetOgSenderEgenSoknad',
            label: 'Har du ektefelle/ partner/samboer  som også skal til  utlandet og sender  egen søknad?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          container({
            conditional: {
              show: true,
              when: 'harDuEktefellePartnerSamboerSomOgsaSkalTilUtlandetOgSenderEgenSoknad',
              eq: 'ja',
            },
            key: 'opplysningerOmEktefellePartnerSamboer',
            label: 'Opplysninger om ektefelle/partner/samboer',
            components: [
              textField({
                autocomplete: 'given-name',
                key: 'fornavn',
                label: 'Fornavn',
              }),
              textField({
                autocomplete: 'family-name',
                key: 'etternavn',
                label: 'Etternavn',
              }),
              radio({
                key: 'harEktefellePartnerSamboerNorskFodselsnummerEllerDNummer',
                label: 'Har ektefelle/partner/samboer norsk fødselsnummer eller d-nummer?',
                values: [
                  { label: 'Ja', value: 'ja' },
                  { label: 'Nei', value: 'nei' },
                ],
              }),
              nationalIdentityNumber({
                conditional: {
                  show: true,
                  when: 'opplysningerOmEktefellePartnerSamboer.harEktefellePartnerSamboerNorskFodselsnummerEllerDNummer',
                  eq: 'ja',
                },
                key: 'fodselsnummerDNummer',
                label: 'Fødselsnummer/d-nummer',
                validate: {
                  custom: 'valid = instance.validateFnrNew(input)',
                },
              }),
              datePicker({
                conditional: {
                  show: true,
                  when: 'opplysningerOmEktefellePartnerSamboer.harEktefellePartnerSamboerNorskFodselsnummerEllerDNummer',
                  eq: 'nei',
                },
                key: 'fodselsdatoDdMmAaaa',
                label: 'Fødselsdato (dd.mm.åååå)',
                validate: {
                  custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                },
              }),
            ],
          }),
        ],
      }),
      panel({
        key: 'tilleggsopplysninger',
        title: 'Tilleggsopplysninger',
        components: [
          radio({
            key: 'harDuNoenFlereOpplysningerTilSoknaden',
            label: 'Har du noen flere  opplysninger til  søknaden? ',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          textArea({
            conditional: {
              show: true,
              when: 'harDuNoenFlereOpplysningerTilSoknaden',
              eq: 'ja',
            },
            key: 'beskrivDisseHer',
            label: 'Beskriv disse her',
          }),
        ],
      }),
      panel({
        isAttachmentPanel: true,
        key: 'vedlegg',
        title: 'Vedlegg',
        components: [
          attachment({
            attachmentType: 'default',
            attachmentValues: {
              leggerVedNaa: {
                enabled: true,
              },
              ettersender: {
                enabled: true,
              },
              levertTidligere: {
                enabled: true,
              },
            },
            customConditional: `show = (data.hvorforSokerDuPaVegneAvEnAnnenPerson === "jegHarFullmakt") ||
       (data.hvorforSokerDuPaVegneAvEnAnnenPerson === "jegRepresentererEnVirksomhetMedFullmakt");`,
            description:
              'For eksempel fullmaktsskjemaet <a href="https://www.nav.no/start/generell-fullmakt" target="_blank">Generell fullmakt NAV 95-15.36 (åpnes i ny fane)</a>.',
            key: 'dokumentasjonPaAtDuHarFullmaktTilASendeInnSkjemaPaVegneAvSoker',
            label: 'Dokumentasjon på at du har fullmakt til å sende inn skjema på vegne av søker',
          }),
          attachment({
            attachmentType: 'default',
            attachmentValues: {
              leggerVedNaa: {
                enabled: true,
              },
              ettersender: {
                enabled: true,
              },
              levertTidligere: {
                enabled: true,
              },
            },
            customConditional: `show = (data.fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv === "ja") &&
       (data.onskerDuAtNoenAndreSkalMottaOgBetaleFakturaForTrygdeavgiftForDeg === "ja");`,
            description:
              'I fullmakten må det stå hvem som skal motta og betale faktura for trygdeavgift. Det må også stå hvilken periode fullmakten gjelder for.',
            key: 'fullmaktForMottakOgBetalingAvFaktura',
            label: 'Fullmakt for mottak og betaling av faktura',
          }),
          attachment({
            attachmentType: 'default',
            attachmentValues: {
              leggerVedNaa: {
                enabled: true,
                additionalDocumentation: {},
              },
              ettersender: {
                enabled: true,
                additionalDocumentation: {},
              },
              levertTidligere: {
                enabled: true,
                additionalDocumentation: {},
              },
              harIkke: {
                additionalDocumentation: {},
              },
              andre: {
                additionalDocumentation: {},
              },
              nav: {
                additionalDocumentation: {},
              },
            },
            conditional: {
              show: true,
              when: 'harDuNorskFodselsnummerEllerDNummer',
              eq: 'nei',
            },
            key: 'kopiAvPassBildesideEllerNasjonaltIdKort',
            label: 'Kopi av pass (bildeside) eller nasjonalt ID-kort',
          }),
          attachment({
            attachmentType: 'default',
            attachmentValues: {
              leggerVedNaa: {
                enabled: true,
              },
              ettersender: {
                enabled: true,
              },
              levertTidligere: {
                enabled: true,
              },
            },
            conditional: {
              show: true,
              when: 'lonnsmottaker2.erDuSendtUtAvEnNorskArbeidsgiverForAJobbeIUtlandet',
              eq: 'ja',
            },
            description:
              'Du må legge ved følgende skjema som arbeidsgiveren din må fylle ut:<br> <a href="https://www.nav.no/fyllut/nav020806" target="_blank">Skjema for arbeidsgiver - bekreftelse på utsending NAV 02-08.06 (åpnes i egen fane)</a>',
            key: 'nav020806TilleggsskjemaForArbeidsgiver',
            label: 'Dokumentasjon på at du er sendt ut av arbeidsgiveren din (NAV 02-08.06)',
          }),
          attachment({
            attachmentType: 'default',
            attachmentValues: {
              leggerVedNaa: {
                enabled: true,
              },
              ettersender: {
                enabled: true,
              },
              levertTidligere: {
                enabled: true,
              },
            },
            conditional: {
              show: true,
              when: 'hvaErDinArbeidssituasjonIPerioden1',
              eq: 'auPairPraktikantEllerArbeidVedSidenAvStudier',
            },
            description: 'Du må legge ved arbeidskontrakt',
            key: 'arbeidskontraktForAuPairPraktikantEllerArbeidIForbindelseMedStudier',
            label: 'Arbeidskontrakt',
          }),
          attachment({
            attachmentType: 'default',
            attachmentValues: {
              leggerVedNaa: {
                enabled: true,
              },
              ettersender: {
                enabled: true,
              },
              levertTidligere: {
                enabled: true,
              },
            },
            customConditional: `show=
_.some(data.barnUnder18ArSomSkalVaereMedTilUtlandet, (rad) => {return (rad.barnetHarIkkeNorskFodselsnummerDNummer === true);});`,
            description: 'Du må legge ved fødselsattest for barn uten norsk fødselsnummer eller d-nummer. ',
            key: 'fodselsattest',
            label: 'Fødselsattest',
          }),
          attachment({
            attachmentType: 'other',
            attachmentValues: {
              leggerVedNaa: {
                enabled: true,
              },
              nei: {
                enabled: true,
              },
            },
            description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
            key: 'annenDokumentasjon',
            label: 'Annen dokumentasjon',
          }),
        ],
      }),
      panel({
        key: 'erklaeringFraSoker',
        title: 'Erklæring fra søker',
        components: [
          checkbox({
            defaultValue: false,
            key: 'jegBekrefterAtOpplysningeneErKorrekteOgErKjentMedAtNavKanInnhenteOpplysningerSomErNodvendigeForAVurdereSoknaden',
            label:
              'Jeg bekrefter at opplysningene er korrekte, og er kjent med at  NAV kan innhente opplysninger som er nødvendige for å vurdere søknaden.',
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'nav020805', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const mellomlagringNestedValuesTranslations = () => getMockTranslationsFromForm(mellomlagringNestedValuesForm());

export { mellomlagringNestedValuesForm, mellomlagringNestedValuesTranslations };
