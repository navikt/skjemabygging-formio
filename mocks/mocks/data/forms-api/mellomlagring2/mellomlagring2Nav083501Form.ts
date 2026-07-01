import {
  alert,
  attachment,
  checkbox,
  container,
  countrySelect,
  currency,
  datePicker,
  formGroup,
  htmlElement,
  nationalIdentityNumber,
  organizationNumber,
  panel,
  radio,
  selectBoxes,
  textArea,
  textField,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const mellomlagring2Nav083501Form = () =>
  form({
    title: 'Inntektsopplysninger for selvstendig næringsdrivende og/eller frilansere som skal ha sykepenger',
    formNumber: 'nav083501',
    path: 'nav083501',
    components: [
      panel({
        key: 'veiledning',
        title: 'Veiledning',
        components: [
          htmlElement({
            content: `Dette skjemaet skal du fylle ut når du skal søke om sykepenger fra Nav. Du skal kun fylle ut og sende inn dette skjemaet én gang.
Hvis du sender inn nye sykepengekrav (forlengelser) skal du ikke fylle ut skjemaet.<br><br>
Hvis du er friskmeldt i mer enn seksten dager, skal nytt skjema sendes inn til Nav. <br><br>

Hvis du i løpet av de siste fire årene har startet næringsvirksomhet,
eller fått en varig endring av arbeidssituasjonen/virksomheten, må du dokumentere dette.`,
            key: 'veiledningstekst',
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
            label: 'Har du norsk fødselsnummer eller D-nummer?',
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
            label: 'Fødselsnummer / D-nummer',
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
            content: `Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse. 
<br>
Du kan <a href="https://www.skatteetaten.no/person/folkeregister/flytte/endre-postadresse/" target="_blank">sjekke og endre din folkeregistrerte adresse på skatteetatens nettsider (åpnes i et nytt vindu).</a>
Hvis du ønsker å motta kommunikasjon fra Nav på en annen adresse enn din folkeregistrerte adresse, kan du bruke lenken ovenfor til å oppgi en postadresse i Folkeregisteret.
Du finner også papirskjema for å endre postadresse på samme siden hos Skatteetaten.`,
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
            label: 'Er kontaktadressen en vegadresse eller postboksadresse?',
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
                label: 'Fra hvilken dato skal denne adressen brukes (dd.mm.åååå)?',
                validate: {
                  custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                },
              }),
              datePicker({
                beforeDateInputKey: 'gyldigFraDatoDdMmAaaa1',
                description:
                  'Du velger selv hvor lenge adressen skal være gyldig, maksimalt 1 år. Etter 1 år må du endre eller forlenge adressen.',
                key: 'gyldigTilDatoDdMmAaaa1',
                label: 'Til hvilken dato skal denne adressen brukes (dd.mm.åååå)?',
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
                label: 'Fra hvilken dato skal denne adressen brukes (dd.mm.åååå)?',
                validate: {
                  custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                },
              }),
              datePicker({
                beforeDateInputKey: 'gyldigFraDatoDdMmAaaa2',
                description:
                  'Du velger selv hvor lenge adressen skal være gyldig, maksimalt 1 år. Etter 1 år må du endre eller forlenge adressen.',
                key: 'gyldigTilDatoDdMmAaaa2',
                label: 'Til hvilken dato skal denne adressen brukes (dd.mm.åååå)?',
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
                    label: 'Vegnavn og husnummer, eller postboks',
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
                    key: 'landSoker',
                    label: 'Land',
                  }),
                ],
              }),
              datePicker({
                key: 'gyldigFraDatoDdMmAaaa',
                label: 'Fra hvilken dato skal denne adressen brukes (dd.mm.åååå)?',
                validate: {
                  custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                },
              }),
              datePicker({
                beforeDateInputKey: 'gyldigFraDatoDdMmAaaa',
                description:
                  'Du velger selv hvor lenge adressen skal være gyldig, maksimalt 1 år. Etter 1 år må du endre eller forlenge adressen.',
                key: 'gyldigTilDatoDdMmAaaa',
                label: 'Til hvilken dato skal denne adressen brukes (dd.mm.åååå)?',
                validate: {
                  custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                },
              }),
            ],
          }),
        ],
      }),
      panel({
        key: 'egenerklaering',
        title: 'Egenerklæring',
        components: [
          checkbox({
            defaultValue: false,
            key: 'jegPlikterAGiDeOpplysningerOgLevereDeDokumenteneSomErNodvendigeForAtNavSkalKunneVurdereMineRettigheter',
            label:
              'Jeg plikter å gi de opplysninger og levere de dokumentene som er nødvendige for at Nav skal kunne vurdere mine rettigheter.',
          }),
          checkbox({
            defaultValue: false,
            key: 'jegHarGjortMegKjentMedMinPliktTilAInformereNavOmEndringerSomKanHaBetydningForSykepengeneJegFarUtbetalt',
            label:
              'Jeg har gjort meg kjent med min plikt til å informere Nav om endringer som kan ha betydning for sykepengene jeg får utbetalt.',
          }),
        ],
      }),
      panel({
        key: 'sykefravaer',
        title: 'Sykefravær',
        components: [
          datePicker({
            key: 'oppgiDatoForForsteSykefravaersdagDdMmAaaa',
            label: ' Oppgi dato for første sykefraværsdag (dd.mm.åååå)',
            validate: {
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
        ],
      }),
      panel({
        key: 'typeVirksomhet',
        title: 'Type virksomhet',
        components: [
          selectBoxes({
            key: 'hvaSlagsVirksomhetDriverDu',
            label: 'Hva slags virksomhet driver du?',
            values: [
              { label: 'Selvstendig næringsdrivende', value: 'selvstendigNaeringsdrivende' },
              { label: 'Frilanser', value: 'frilanser' },
            ],
          }),
          selectBoxes({
            conditional: {
              show: true,
              when: 'hvaSlagsVirksomhetDriverDu',
              eq: 'selvstendigNaeringsdrivende',
            },
            description: 'Du kan sette flere kryss',
            key: 'hvaSlagsSelvstendigNaeringsvirksomhetDriverDu',
            label: 'Hva slags selvstendig næringsvirksomhet driver du?',
            values: [
              { label: 'Enkeltpersonforetak', value: 'enkeltpersonforetak' },
              { label: 'Fiske, Blad A', value: 'fiskeBladA' },
              { label: 'Fiske, Blad B', value: 'fiskeBladB' },
              { label: 'Fiske, Lott', value: 'fiskeLott' },
              { label: 'Fiske, Hyre', value: 'fiskeHyre' },
              { label: 'Jordbruk/skogbruk/reindrift', value: 'jordbrukSkogbruk' },
              { label: 'Dagmamma i eget hjem', value: 'dagmammaIEgetHjem' },
              { label: 'Annen virksomhet', value: 'annenVirksomhet' },
            ],
          }),
          textField({
            conditional: {
              show: true,
              when: 'hvaSlagsSelvstendigNaeringsvirksomhetDriverDu',
              eq: 'annenVirksomhet',
            },
            key: 'spesifiserAnnenVirksomhet',
            label: 'Spesifiser annen virksomhet',
          }),
          radio({
            key: 'harDuInntekterSomArbeidstakerITilleggTilInntektSomSelvstendigNaeringsdrivendeOgEllerFrilanser',
            label:
              ' Har du inntekter som arbeidstaker i tillegg til inntekt som selvstendig næringsdrivende og/eller frilanser?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
        ],
      }),
      panel({
        key: 'opplysningerOmDenSelvstendigeVirksomheten',
        title: 'Opplysninger om den selvstendige virksomheten',
        components: [
          htmlElement({
            content: '<b>Fylles ut av den selvstendig næringsdrivende.</b>',
            key: 'html1',
          }),
          datePicker({
            key: 'narStartetDuVirksomhetenDinDdMmAaaa',
            label: 'Når startet du virksomheten din? (dd.mm.åååå)',
            validate: {
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
          organizationNumber({
            key: 'orgNr',
            label: 'Virksomhetens organisasjonsnummer',
            validate: {
              required: false,
              custom: 'valid = instance.validateOrganizationNumber(input)',
            },
          }),
          currency({
            key: 'hvaHarDuHattINaeringsresultatForSkattDeSiste12Manedene',
            label: 'Hva har du hatt i næringsresultat før skatt de siste 12 månedene?',
          }),
          alert({
            content: 'Næringsresultat er inntekt du har i næringen din, minus utgifter og avskrivninger.',
            key: 'alertstripe1',
          }),
          radio({
            key: 'harDetVaertDriftIVirksomhetenFremTilDuBleSykmeldt',
            label: ' Har det vært drift i virksomheten frem til du ble  sykmeldt?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          datePicker({
            conditional: {
              show: true,
              when: 'harDetVaertDriftIVirksomhetenFremTilDuBleSykmeldt',
              eq: 'nei',
            },
            key: 'datoForNarDriftenOpphorteDdMmAaaa',
            label: 'Dato for når driften opphørte (dd.mm.åååå)',
            validate: {
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
          radio({
            key: 'vilDuFortsattHaNaeringsinntektMensDuErSykmeldt',
            label: ' Vil du fortsatt ha næringsinntekt mens du er sykmeldt?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          currency({
            conditional: {
              show: true,
              when: 'vilDuFortsattHaNaeringsinntektMensDuErSykmeldt',
              eq: 'ja',
            },
            key: 'oppgiAntattNaeringsinntekt',
            label: 'Oppgi antatt overskudd i næring',
          }),
          radio({
            key: 'erVirksomhetenRegistrertINorge',
            label: 'Er virksomheten registrert i Norge?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          countrySelect({
            conditional: {
              show: true,
              when: 'erVirksomhetenRegistrertINorge',
              eq: 'nei',
            },
            key: 'landvelger',
            label: 'Hvilket annet land er virksomheten registrert i?',
          }),
        ],
      }),
      panel({
        key: 'tilleggsopplysningerForSelvstendigNaeringsdrivende',
        title: 'Tilleggsopplysninger for selvstendig næringsdrivende',
        components: [
          radio({
            key: 'harDuFattEnVarigEndringAvArbeidssituasjonenVirksomhetenILopetAvDeSisteFireArene',
            label: 'Har du fått en varig endring av arbeidssituasjonen/virksomheten i løpet av de siste fire årene?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          textArea({
            conditional: {
              show: true,
              when: 'harDuFattEnVarigEndringAvArbeidssituasjonenVirksomhetenILopetAvDeSisteFireArene',
              eq: 'ja',
            },
            key: 'beskrivEndringen',
            label: 'Beskriv endringen her',
          }),
          currency({
            conditional: {
              show: true,
              when: 'harDuFattEnVarigEndringAvArbeidssituasjonenVirksomhetenILopetAvDeSisteFireArene',
              eq: 'ja',
            },
            key: 'inntektEtterEndringen',
            label: 'Inntekt etter endringen',
          }),
        ],
      }),
      panel({
        key: 'tilleggsopplysningerForFrilanser',
        title: 'Tilleggsopplysninger for frilanser',
        components: [
          datePicker({
            key: 'narStartetDuSomFrilanserDdMmAaaa',
            label: 'Når startet du som frilanser? dato (dd.mm.åååå)',
            validate: {
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
          radio({
            key: 'harDuInntektFraFosterhjem',
            label: 'Har du inntekt fra fosterhjem?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
        ],
      }),
      panel({
        key: 'andreOpplysninger',
        title: 'Andre opplysninger',
        components: [
          radio({
            key: 'andreOpplysningerDuMenerErViktigeNarNavSkalFastsetteSykepengegrunnlagetDitt',
            label: 'Har du andre opplysninger du mener er viktige når Nav skal fastsette sykepengegrunnlaget ditt?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          textArea({
            conditional: {
              show: true,
              when: 'andreOpplysningerDuMenerErViktigeNarNavSkalFastsetteSykepengegrunnlagetDitt',
              eq: 'ja',
            },
            key: 'andreViktigeOpplysninger',
            label: 'Andre viktige opplysninger',
          }),
          radio({
            key: 'harDuDokumentasjonDuOnskerALeggeVedSoknaden',
            label: 'Har du dokumentasjon du ønsker å legge ved søknaden?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          selectBoxes({
            customConditional: `show=
(data.harDuDokumentasjonDuOnskerALeggeVedSoknaden === "ja") &&
(data.hvaSlagsVirksomhetDriverDu.selvstendigNaeringsdrivende === true);`,
            key: 'hvaOnskerDuALeggeVed',
            label: 'Hva ønsker du å legge ved?',
            values: [
              { label: 'Personinntektsskjema', value: 'personinntektsskjema' },
              { label: 'Resultatregnskap', value: 'resultatregnskap' },
              { label: 'Næringsoppgave', value: 'naeringsoppgave' },
              { label: 'Annet', value: 'annet' },
            ],
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
            customConditional: `show=
(data.hvaOnskerDuALeggeVed.personinntektsskjema === true);`,
            key: 'personinntektsskjema1',
            label: 'Personinntektsskjema',
          }),
          attachment({
            attachmentType: 'default',
            customConditional: `show=
(data.hvaOnskerDuALeggeVed.resultatregnskap === true);
`,
            key: 'resultatregnskap1',
            label: 'Resultatregnskap',
          }),
          attachment({
            attachmentType: 'default',
            customConditional: `show=
(data.hvaOnskerDuALeggeVed.naeringsoppgave === true);`,
            key: 'naeringsoppgave1',
            label: 'Næringsoppgave',
          }),
          attachment({
            attachmentType: 'other',
            customConditional: `show=
((data.hvaSlagsVirksomhetDriverDu.frilanser === true) && (data.hvaSlagsVirksomhetDriverDu.selvstendigNaeringsdrivende === false)) ||
((data.hvaSlagsVirksomhetDriverDu.selvstendigNaeringsdrivende === true) && (data.hvaOnskerDuALeggeVed.annet === true));
`,
            description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
            key: 'annenDokumentasjon',
            label: 'Annen dokumentasjon',
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'nav083501', submissionTypes: ['PAPER', 'DIGITAL'] }),
    introPage: formIntroPageWithoutSelfDeclaration(),
  });

const mellomlagring2Nav083501Translations = () => getMockTranslationsFromForm(mellomlagring2Nav083501Form());

export { mellomlagring2Nav083501Form, mellomlagring2Nav083501Translations };
