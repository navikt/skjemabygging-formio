/*
 * Production form tests for Søknad om alderspensjon
 * Form: nav190105
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 9 same-panel/cross-panel conditionals
 *       harDuNorskFodselsnummerEllerDNummer → fodselsnummerDNummerSoker, borDuINorge, alertstripe
 *       borDuINorge / vegadresseEllerPostboksadresse → Norwegian/foreign address groups
 *       jegHarIkkeTelefonnummer → telefonnummer
 *       erDuNorskStatsborger → statsborgerskap
 *       harDuStatusSomFlyktning → kopiAvVedtakOmOppholdsgrunnlagFraUdi on Vedlegg
 *       + birth date controls panel-level Livsvarig AFP visibility
 *   - Sivilstatus (sivilstatus): 2 same-panel conditionals + panel routing
 *       hvaErDinSivilstand → leverDuOgEktefellenPartnerenSamboerenVarigAtskilt
 *       leverDuOgEktefellenPartnerenSamboerenVarigAtskilt → income container
 *       + panel-level routing to Ektefelle / Avdød panels
 *   - Ektefelle, partner, samboer (ektefellePartnerSamboer): 4 same-panel conditionals
 *       harDinEktefellePartnerEllerNorskFodselsnummer → fnr/dob + vedlegg
 *       hvaErDinSivilstand=samboer → samboer details + samboers statsborgerskap
 *   - Utenlandsopphold (utenlandsopphold): 1 same-panel conditional + panel routing
 *       harDuBoddEllerArbeidetUtenforNorgeEtterFylte16ArGjelderIkkeFerieopphold2 → borDuIUtlandetNa1
 *       + routes to Arbeid og opphold i utlandet / Norge and Pensjon fra andre land enn Norge
 *   - Pensjon fra andre land enn Norge: 1 same-panel conditional
 *       harDuPensjonFraAndreLandEnnNorge → datagrid
 *   - Arbeid og opphold i Norge: 3 same-panel conditionals + vedlegg trigger
 *       boddEllerArbeidet → norsk adresse / arbeidsforhold
 *       hvaSlagsArbeidsforholdHaddeDuIDennePerioden → navnPaArbeidsgiver
 *       onskerDuALeggeVedDokumentasjonPaOppholdINorge → dokumentasjonPaOppholdINorge on Vedlegg
 *   - Avtalefestet pensjon (AFP): 1 same-panel conditional
 *       vilDuSokeAfpFraPrivatSektor → alertstripe
 *   - Vedlegg (vedlegg): 6 cross-panel attachment conditionals
 */

const formatDate = (date: Date) =>
  `${`${date.getDate()}`.padStart(2, '0')}.${`${date.getMonth() + 1}`.padStart(2, '0')}.${date.getFullYear()}`;

const formatMonth = (date: Date) => `${`${date.getMonth() + 1}`.padStart(2, '0')}.${date.getFullYear()}`;

const plusDays = (base: Date, days: number) => {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
};

const futureMonth = () => formatMonth(new Date(new Date().getFullYear() + 1, 0, 1));
const addressFromDate = formatDate(plusDays(new Date(), 1));
const addressToDate = formatDate(plusDays(new Date(), 30));

const selectRadio = (label: string, option: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const openStepper = () => {
  cy.findByRoleWhenAttached('button', { name: 'Vis alle steg' }).then(($button) => {
    ($button[0] as HTMLButtonElement).click();
  });
};

const openStep = (name: string) => {
  cy.findByRoleWhenAttached('link', { name }).then(($link) => {
    ($link[0] as HTMLElement).click();
  });
};

const fillDineOpplysningerForForeignApplicant = ({ refugee = true }: { refugee?: boolean } = {}) => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
  cy.findByRole('textbox', { name: /Din fødselsdato/ }).type('15.01.1960');
  selectRadio('Bor du i Norge?', 'Nei');
  cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).type('Rue de Test 1');
  cy.findByRole('textbox', { name: 'Land' }).type('Frankrike');
  cy.findByRole('textbox', { name: /Fra hvilken dato skal denne adressen brukes/ }).type(addressFromDate);
  cy.findByRole('textbox', { name: /Til hvilken dato skal denne adressen brukes/ }).type(addressToDate);
  cy.findByLabelText('Telefonnummer').type('12345678');
  selectRadio('Er du norsk statsborger?', 'Nei');
  cy.findByRole('textbox', { name: 'Statsborgerskap' }).type('Fransk');
  selectRadio('Har du status som flyktning?', refugee ? 'Ja' : 'Nei');
  cy.findByRole('checkbox', {
    name: /Jeg bekrefter at jeg har lest informasjonen om bankkontonummer/,
  }).click();
};

const fillSivilstatusGift = ({ spouseIncomeAbroad = true }: { spouseIncomeAbroad?: boolean } = {}) => {
  selectRadio('Sivilstatus', 'Gift eller partner');
  selectRadio('Lever du og ektefellen / partneren / samboeren varig atskilt?', 'Nei');
  cy.findByRole('textbox', {
    name: /Hva er din ektefelles, partners eller samboers samlede årlige inntekt før skatt/,
  }).type('500000');
  selectRadio('Mottar eller søker din ektefelle, partner eller samboer AFP fra privat eller offentlig sektor?', 'Nei');
  selectRadio('Har din ektefelle, partner eller samboer inntekt i utlandet?', spouseIncomeAbroad ? 'Ja' : 'Nei');
};

const fillPensjonsuttak = () => {
  cy.findByRole('textbox', { name: /Tidspunkt du ønsker alderspensjon fra/ }).type(futureMonth());
  selectRadio('Velg ønsket uttaksgrad for alderspensjon', '100');
};

const fillSpouseWithoutFnr = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  selectRadio('Har din ektefelle, partner eller samboer norsk fødselsnummer eller d-nummer?', 'Nei');
  cy.findByRole('textbox', { name: /Ektefelles, partners eller samboers fødselsdato/ }).type('01.01.1962');
};

describe('nav190105', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav190105/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('toggles fnr, address, phone and citizenship branches', () => {
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).should('not.exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).should('exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).should('not.exist');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      selectRadio('Bor du i Norge?', 'Ja');
      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('exist');

      selectRadio('Er kontaktadressen din en vegadresse eller postboksadresse?', 'Vegadresse');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      selectRadio('Er kontaktadressen din en vegadresse eller postboksadresse?', 'Postboksadresse');
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');

      selectRadio('Bor du i Norge?', 'Nei');
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).should('exist');

      cy.findByLabelText('Telefonnummer').should('exist');
      cy.findByRole('checkbox', { name: /Jeg har ikke telefonnummer/ }).click();
      cy.findByLabelText('Telefonnummer').should('not.exist');

      cy.findByRole('textbox', { name: 'Statsborgerskap' }).should('not.exist');
      selectRadio('Er du norsk statsborger?', 'Nei');
      cy.findByRole('textbox', { name: 'Statsborgerskap' }).should('exist');
    });

    it('shows vedtak attachment when applicant has refugee status', () => {
      fillDineOpplysningerForForeignApplicant();
      openStepper();
      openStep('Vedlegg');

      cy.findByRole('group', { name: /oppholdsgrunnlag fra UDI|asylstatus/i }).should('exist');
    });
  });

  describe('Sivilstatus conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav190105/sivilstatus?sub=paper');
      cy.defaultWaits();
    });

    it('toggles spouse separation and income container by status', () => {
      cy.findByLabelText('Lever du og ektefellen / partneren / samboeren varig atskilt?').should('not.exist');

      selectRadio('Sivilstatus', 'Gift eller partner');
      cy.findByLabelText('Lever du og ektefellen / partneren / samboeren varig atskilt?').should('exist');
      cy.findByRole('textbox', {
        name: /Hva er din ektefelles, partners eller samboers samlede årlige inntekt før skatt/,
      }).should('not.exist');

      selectRadio('Lever du og ektefellen / partneren / samboeren varig atskilt?', 'Nei');
      cy.findByRole('textbox', {
        name: /Hva er din ektefelles, partners eller samboers samlede årlige inntekt før skatt/,
      }).should('exist');

      selectRadio('Lever du og ektefellen / partneren / samboeren varig atskilt?', 'Ja');
      cy.findByRole('textbox', {
        name: /Hva er din ektefelles, partners eller samboers samlede årlige inntekt før skatt/,
      }).should('not.exist');

      selectRadio('Sivilstatus', 'Enslig');
      cy.findByLabelText('Lever du og ektefellen / partneren / samboeren varig atskilt?').should('not.exist');
    });

    it('routes to spouse or deceased-spouse panels based on civil status', () => {
      openStepper();
      cy.findByRole('link', { name: 'Ektefelle, partner, samboer' }).should('not.exist');
      cy.findByRole('link', { name: 'Avdød ektefelle, partner, samboer' }).should('not.exist');

      selectRadio('Sivilstatus', 'Gift eller partner');
      cy.findByRole('link', { name: 'Ektefelle, partner, samboer' }).should('exist');
      cy.findByRole('link', { name: 'Avdød ektefelle, partner, samboer' }).should('not.exist');

      selectRadio('Sivilstatus', 'Enke, enkemann eller gjenlevende partner / samboer');
      cy.findByRole('link', { name: 'Avdød ektefelle, partner, samboer' }).should('exist');
      cy.findByRole('link', { name: 'Ektefelle, partner, samboer' }).should('not.exist');
    });
  });

  describe('Ektefelle, partner, samboer conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav190105/sivilstatus?sub=paper');
      cy.defaultWaits();
      selectRadio('Sivilstatus', 'Gift eller partner');
      openStepper();
      openStep('Ektefelle, partner, samboer');
    });

    it('toggles spouse fnr and birthdate fields', () => {
      cy.findByRole('textbox', {
        name: /Ektefelles, partners eller samboers fødselsnummer eller d-nummer/,
      }).should('not.exist');
      cy.findByRole('textbox', { name: /Ektefelles, partners eller samboers fødselsdato/ }).should('not.exist');

      selectRadio('Har din ektefelle, partner eller samboer norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', {
        name: /Ektefelles, partners eller samboers fødselsnummer eller d-nummer/,
      }).should('exist');
      cy.findByRole('textbox', { name: /Ektefelles, partners eller samboers fødselsdato/ }).should('not.exist');

      selectRadio('Har din ektefelle, partner eller samboer norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByRole('textbox', {
        name: /Ektefelles, partners eller samboers fødselsnummer eller d-nummer/,
      }).should('not.exist');
      cy.findByRole('textbox', { name: /Ektefelles, partners eller samboers fødselsdato/ }).should('exist');
    });

    it('shows samboer-only fields and samboer citizenship details', () => {
      openStep('Sivilstatus');
      selectRadio('Sivilstatus', 'Samboer');
      openStep('Ektefelle, partner, samboer');

      cy.findByText('Du og samboeren din har dere, eller har dere hatt felles barn?').should('exist');
      cy.findByRole('textbox', { name: 'Samboers statsborgerskap' }).should('not.exist');

      selectRadio('Er samboeren din norsk statborger?', 'nei');
      cy.findByRole('textbox', { name: 'Samboers statsborgerskap' }).should('exist');
    });
  });

  describe('Utenlandsopphold and downstream panels', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav190105/utenlandsopphold?sub=paper');
      cy.defaultWaits();
    });

    it('shows current-abroad question only when applicant has lived or worked abroad', () => {
      cy.findByLabelText('Bor du i utlandet nå?').should('not.exist');

      selectRadio('Har du bodd eller arbeidet utenfor Norge etter fylte 16 år?', 'Ja');
      cy.findByLabelText('Bor du i utlandet nå?').should('exist');

      selectRadio('Har du bodd eller arbeidet utenfor Norge etter fylte 16 år?', 'Nei');
      cy.findByLabelText('Bor du i utlandet nå?').should('not.exist');
    });

    it('routes to the correct abroad-work panel based on current residence', () => {
      selectRadio('Har du bodd eller arbeidet utenfor Norge etter fylte 16 år?', 'Ja');
      openStepper();
      cy.findByRole('link', { name: 'Pensjon fra andre land enn Norge' }).should('exist');

      selectRadio('Bor du i utlandet nå?', 'Nei');
      cy.findByRole('link', { name: 'Arbeid og opphold i utlandet' }).should('exist');
      cy.findByRole('link', { name: 'Arbeid og opphold i Norge' }).should('not.exist');

      selectRadio('Bor du i utlandet nå?', 'Ja');
      cy.findByRole('link', { name: 'Arbeid og opphold i Norge' }).should('exist');
      cy.findByRole('link', { name: 'Arbeid og opphold i utlandet' }).should('not.exist');
    });
  });

  describe('Pensjon fra andre land enn Norge conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav190105/utenlandsopphold?sub=paper');
      cy.defaultWaits();
      selectRadio('Har du bodd eller arbeidet utenfor Norge etter fylte 16 år?', 'Ja');
      openStepper();
      openStep('Pensjon fra andre land enn Norge');
    });

    it('shows the pension datagrid only when applicant receives foreign pension', () => {
      cy.findByRole('textbox', { name: 'Pensjonsordningens navn' }).should('not.exist');

      selectRadio('Har du pensjon fra andre land enn Norge?', 'Ja');
      cy.findByRole('textbox', { name: 'Pensjonsordningens navn' }).should('exist');
      cy.findByRole('combobox', { name: 'Velg valuta' }).should('exist');

      selectRadio('Har du pensjon fra andre land enn Norge?', 'Nei');
      cy.findByRole('textbox', { name: 'Pensjonsordningens navn' }).should('not.exist');
    });
  });

  describe('Arbeid og opphold i Norge conditionals', () => {
    const visitArbeidOgOppholdINorge = () => {
      cy.visit('/fyllut/nav190105/utenlandsopphold?sub=paper');
      cy.defaultWaits();
      selectRadio('Har du bodd eller arbeidet utenfor Norge etter fylte 16 år?', 'Ja');
      selectRadio('Bor du i utlandet nå?', 'Ja');
      openStepper();
      openStep('Arbeid og opphold i Norge');
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).type('01.01.2024');
      cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).type('01.01.2025');
    };

    it('toggles address and employment fields from selectboxes', () => {
      visitArbeidOgOppholdINorge();

      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('group', { name: 'Hva slags arbeidsforhold hadde du i denne perioden?' }).should('not.exist');

      cy.findByRole('group', {
        name: 'Kryss av for om du har bodd og / eller arbeidet i Norge i denne perioden',
      }).within(() => {
        cy.findByRole('checkbox', { name: 'Bodd' }).check();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');

      cy.findByRole('group', {
        name: 'Kryss av for om du har bodd og / eller arbeidet i Norge i denne perioden',
      }).within(() => {
        cy.findByRole('checkbox', { name: 'Arbeidet' }).check();
      });
      cy.findByRole('group', { name: 'Hva slags arbeidsforhold hadde du i denne perioden?' }).should('exist');

      cy.findByRole('group', { name: 'Hva slags arbeidsforhold hadde du i denne perioden?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Jeg var ansatt hos en arbeidsgiver' }).check();
      });
      cy.findByRole('textbox', { name: 'Navn på arbeidsgiver' }).should('exist');
    });

    it('shows opphold documentation attachment when applicant chooses to attach it', () => {
      visitArbeidOgOppholdINorge();

      cy.findByRole('group', {
        name: 'Kryss av for om du har bodd og / eller arbeidet i Norge i denne perioden',
      }).within(() => {
        cy.findByRole('checkbox', { name: 'Arbeidet' }).check();
      });
      cy.findByRole('group', { name: 'Hva slags arbeidsforhold hadde du i denne perioden?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Jeg var ansatt hos en arbeidsgiver' }).check();
      });
      cy.findByRole('textbox', { name: 'Navn på arbeidsgiver' }).type('NAV');
      selectRadio('Ønsker du å legge ved dokumentasjon på opphold i Norge?', 'Ja');

      openStep('Vedlegg');
      cy.findByRole('group', { name: /dokumentasjon på opphold i Norge|studiested\/skole/i }).should('exist');
    });
  });

  describe('Livsvarig AFP i offentlig sektor', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav190105/dineOpplysninger?sub=paper');
      cy.defaultWaits();
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      openStepper();
    });

    it('shows the AFP panel only for applicants born before 1964', () => {
      cy.findByRole('link', { name: 'Livsvarig AFP i offentlig sektor' }).should('not.exist');

      cy.findByRole('textbox', { name: /Din fødselsdato/ }).type('15.01.1960');
      cy.findByRole('link', { name: 'Livsvarig AFP i offentlig sektor' }).should('exist');

      cy.findByRole('textbox', { name: /Din fødselsdato/ }).clear();
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).type('15.01.1965');
      cy.findByRole('link', { name: 'Livsvarig AFP i offentlig sektor' }).should('not.exist');
    });
  });

  describe('Avtalefestet pensjon (AFP) conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav190105/avtalefestetPensjonAFP?sub=paper');
      cy.defaultWaits();
    });

    it('shows the guidance alert only when applicant wants AFP from private sector', () => {
      cy.contains('Avkrysningen her regnes ikke som en søknad om AFP.').should('not.exist');

      selectRadio('Vil du søke AFP fra privat sektor?', 'Ja');
      cy.contains('Avkrysningen her regnes ikke som en søknad om AFP.').should('exist');

      selectRadio('Vil du søke AFP fra privat sektor?', 'Nei');
      cy.contains('Avkrysningen her regnes ikke som en søknad om AFP.').should('not.exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows spouse- and applicant-specific attachments for the attachment-heavy branch', () => {
      cy.visit('/fyllut/nav190105/dineOpplysninger?sub=paper');
      cy.defaultWaits();
      fillDineOpplysningerForForeignApplicant();
      openStepper();
      openStep('Sivilstatus');
      fillSivilstatusGift();
      openStep('Ektefelle, partner, samboer');
      fillSpouseWithoutFnr();
      openStep('Utenlandsopphold');
      selectRadio('Har du bodd eller arbeidet utenfor Norge etter fylte 16 år?', 'Ja');
      selectRadio('Bor du i utlandet nå?', 'Ja');
      openStep('Vedlegg');

      cy.findByRole('group', { name: /oppholdsgrunnlag fra UDI|asylstatus/i }).should('exist');
      cy.findByRole('group', { name: /ektefelles eller partners pass/i }).should('exist');
      cy.findByRole('group', { name: /dokumentasjon på statsborgerskap/i }).should('exist');
      cy.findByRole('group', { name: /ektefelles, partners eller samboers inntekt i utlandet|inntekt/i }).should(
        'exist',
      );
      cy.findByRole('group', { name: /dokumentasjon på inngått ekteskap|ekteskapsinngåelse/i }).should('exist');
    });

    it('hides conditional attachments for the opposite branch', () => {
      cy.visit('/fyllut/nav190105/dineOpplysninger?sub=paper');
      cy.defaultWaits();
      fillDineOpplysningerForForeignApplicant({ refugee: false });
      openStepper();
      openStep('Sivilstatus');
      fillSivilstatusGift({ spouseIncomeAbroad: false });
      openStep('Ektefelle, partner, samboer');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectRadio('Har din ektefelle, partner eller samboer norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', {
        name: /Ektefelles, partners eller samboers fødselsnummer eller d-nummer/,
      }).type('17912099997');
      openStep('Vedlegg');

      cy.findByRole('group', { name: /oppholdsgrunnlag fra UDI|asylstatus/i }).should('not.exist');
      cy.findByRole('group', { name: /ektefelles eller partners pass/i }).should('not.exist');
      cy.findByRole('group', { name: /ektefelles, partners eller samboers inntekt i utlandet|inntekt/i }).should(
        'not.exist',
      );
      cy.findByRole('group', { name: /dokumentasjon på inngått ekteskap|ekteskapsinngåelse/i }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav190105/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('fills a simple happy path and verifies summary', () => {
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).type('17912099997');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).type('15.01.1960');
      cy.findByLabelText('Telefonnummer').type('12345678');
      selectRadio('Er du norsk statsborger?', 'Ja');
      selectRadio('Har du status som flyktning?', 'Nei');
      cy.findByRole('checkbox', {
        name: /Jeg bekrefter at jeg har lest informasjonen om bankkontonummer/,
      }).click();
      cy.clickNextStep();

      selectRadio('Sivilstatus', 'Enslig');
      cy.clickNextStep();

      fillPensjonsuttak();
      cy.clickNextStep();

      selectRadio('Har du bodd eller arbeidet utenfor Norge etter fylte 16 år?', 'Nei');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Livsvarig AFP i offentlig sektor' }).should('exist');
      cy.clickNextStep();

      selectRadio('Vil du søke AFP fra privat sektor?', 'Nei');
      cy.clickNextStep();

      selectRadio('Hadde du omsorg for barn under sju år i perioden før 1992?', 'Nei');

      openStepper();
      openStep('Vedlegg');
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Sivilstatus', () => {
        cy.contains('dd', 'Enslig').should('exist');
      });
      cy.withinSummaryGroup('Barn', () => {
        cy.contains('dd', 'Nei').should('exist');
      });
    });
  });
});
