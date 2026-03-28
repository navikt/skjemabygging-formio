/*
 * Production form tests for Søknad om uføretrygd
 * Form: nav120605
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Veiledning (veiledning): 6 same-panel conditionals
 *       confirmation checkbox → work / næringsdrivende / gårdsbruk questions
 *       each yes-answer → attachment guidance alert
 *   - Dine opplysninger (personopplysninger): 4 customConditionals
 *       identitet.harDuFodselsnummer → adresse, adresseVarighet, applicant alerts
 *   - Sivilstatus (sivilstatus): 2 panel-level conditionals
 *       hvaErDinSivilstatus → Ektefelle eller partner / Samboer panels
 *   - Ektefelle eller partner (ektefelleEllerPartner): 5 same-panel conditionals
 *       partner identity / citizenship branches
 *   - Samboer (samboer): 3 same-panel conditionals
 *       samboer identity / citizenship branches
 *   - Arbeid (arbeid): 6 cross-panel + same-panel conditionals
 *       veiledning answers → arbeid branches and income attachments
 *   - Utenlandsopphold (utenlandsopphold): 3 same-panel conditionals
 *       utenlandsopphold / statsborgerskap / utenlandspensjon branches
 *   - Barn under 18 år (barnunder18ar): grouped panel-level + datagrid conditionals
 *       sivilstatus → parent question, child identity / custody / bidrag chain
 *   - Egen inntekt (egenInntekt): grouped cross-panel + same-panel conditionals
 *       harDuBarnUnder18Ar / mottarDuPensjonFraUtlandet → applicant income fields
 *   - Ekstra dokumentasjon til Nav (page10): 1 same-panel conditional
 *   - Vedlegg (vedlegg): grouped cross-panel attachments from veiledning, spouse, child, and extra-doc answers
 */

const visitWithFreshState = (url: string) => {
  cy.visit(url, {
    onBeforeLoad: (win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    },
  });
  cy.get('h2#page-title').should('exist');
};

const visitPanel = (panelKey: string) => {
  visitWithFreshState(`/fyllut/nav120605/${panelKey}?sub=paper`);
};

const selectRadio = (label: string | RegExp, option: string | RegExp) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const clickStepperLink = (title: string) => {
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: title }).click();
};

const incomeConditionals = [
  {
    question: /Har du eller forventer du å få arbeidsinntekt/,
    amountLabel: /Årlig brutto arbeidsinntekt/,
  },
  {
    question: /Mottar du en eller flere pensjonsgivende ytelser fra Nav/,
    amountLabel: /Forventet brutto årlig pensjonsgivende ytelser/,
  },
  {
    question: /Har du eller forventer du å få næringsinntekt/,
    amountLabel: /Brutto årlig næringsinntekt/,
  },
  {
    question: /Har du eller forventer du å få inntekt fra utlandet/,
    amountLabel: /Brutto årsinntekt fra utlandet/,
  },
  {
    question: /Mottar du pensjon fra andre enn Nav \(offentlig eller privat\)\?/,
    amountLabel: /Brutto årlig pensjon fra andre enn Nav/,
  },
  {
    question: /Mottar du\s+familiepleieytelse og\/eller krigspensjon fra Nav\?/,
    amountLabel: /Brutto årlig\s+familiepleieytelse og krigspensjon fra Nav/,
  },
] as const;

describe('nav120605', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Veiledning conditionals', () => {
    it('reveals the follow-up questions after the confirmation checkbox and shows all guidance alerts on yes', () => {
      visitPanel('veiledning');

      cy.findByLabelText('Er du i arbeid nå?').should('not.exist');
      cy.findByLabelText('Er du næringsdrivende?').should('not.exist');
      cy.findByLabelText('Driver du gårdsbruk?').should('not.exist');

      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare/ }).click();

      cy.findByLabelText('Er du i arbeid nå?').should('exist');
      cy.findByLabelText('Er du næringsdrivende?').should('exist');
      cy.findByLabelText('Driver du gårdsbruk?').should('exist');

      selectRadio('Er du i arbeid nå?', 'Ja');
      cy.contains('Arbeidsgiver må fylle ut NAV 12-06.06').should('exist');

      selectRadio('Er du næringsdrivende?', 'Ja');
      cy.contains('NAV 12-06.07 Inntektsskjema for næringsdrivende').should('exist');

      selectRadio('Driver du gårdsbruk?', 'Ja');
      cy.contains('NAV 12-06.09 Inntektsskjema for gårdbrukere').should('exist');
    });
  });

  describe('Dine opplysninger conditionals', () => {
    it('shows address and address-validity fields when applicant has no Norwegian identity number', () => {
      visitPanel('personopplysninger');

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      selectRadio('Bor du i Norge?', 'Nei');
      cy.findByRole('combobox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');
    });

    it('shows the folkeregister alert and hides address fields when applicant has Norwegian identity number', () => {
      visitPanel('personopplysninger');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');

      cy.contains('Nav sender svar på søknad og annen kommunikasjon').should('exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');
    });
  });

  describe('Sivilstatus panel conditionals', () => {
    it('shows the spouse or samboer panels only for the matching civil status', () => {
      visitPanel('sivilstatus');
      cy.clickShowAllSteps();

      cy.findByRole('link', { name: 'Ektefelle eller partner' }).should('not.exist');
      cy.findByRole('link', { name: 'Samboer' }).should('not.exist');

      selectRadio('Hva er din sivilstatus?', 'Gift eller partner');
      cy.findByRole('link', { name: 'Ektefelle eller partner' }).should('exist');
      cy.findByRole('link', { name: 'Samboer' }).should('not.exist');

      selectRadio('Hva er din sivilstatus?', 'Samboer');
      cy.findByRole('link', { name: 'Ektefelle eller partner' }).should('not.exist');
      cy.findByRole('link', { name: 'Samboer' }).should('exist');

      selectRadio('Hva er din sivilstatus?', 'Enslig');
      cy.findByRole('link', { name: 'Ektefelle eller partner' }).should('not.exist');
      cy.findByRole('link', { name: 'Samboer' }).should('not.exist');
    });
  });

  describe('Ektefelle eller partner conditionals', () => {
    it('toggles spouse identity and citizenship follow-up fields', () => {
      visitPanel('sivilstatus');
      selectRadio('Hva er din sivilstatus?', 'Gift eller partner');
      clickStepperLink('Ektefelle eller partner');

      cy.findByLabelText('Ektefelles eller partners fødselsnummer eller d-nummer').should('not.exist');
      cy.findByRole('textbox', { name: /Ektefelle eller partners fødselsdato/ }).should('not.exist');

      selectRadio('Har din ektefelle eller partner norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByLabelText('Ektefelles eller partners fødselsnummer eller d-nummer').should('exist');
      cy.findByRole('textbox', { name: /Ektefelle eller partners fødselsdato/ }).should('not.exist');

      selectRadio('Har din ektefelle eller partner norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Ektefelles eller partners fødselsnummer eller d-nummer').should('not.exist');
      cy.findByRole('textbox', { name: /Ektefelle eller partners fødselsdato/ }).should('exist');

      cy.findByRole('textbox', { name: /statsborgerskap/ }).should('not.exist');
      cy.findByLabelText('Hadde din ektefelle eller partner et annet navn før dere giftet dere?').should('not.exist');

      selectRadio('Er din ektefelle eller partner utenlandsk statsborger?', 'Ja');
      cy.findByRole('textbox', { name: /statsborgerskap/ }).should('exist');
      cy.findByLabelText('Hadde din ektefelle eller partner et annet navn før dere giftet dere?').should('exist');

      selectRadio('Hadde din ektefelle eller partner et annet navn før dere giftet dere?', 'Ja');
      cy.findByRole('textbox', { name: 'Ektefelles eller partners tidligere navn' }).should('exist');

      selectRadio('Hadde din ektefelle eller partner et annet navn før dere giftet dere?', 'Nei');
      cy.findByRole('textbox', { name: 'Ektefelles eller partners tidligere navn' }).should('not.exist');
    });
  });

  describe('Samboer conditionals', () => {
    it('toggles samboer identity and citizenship follow-up fields', () => {
      visitPanel('sivilstatus');
      selectRadio('Hva er din sivilstatus?', 'Samboer');
      clickStepperLink('Samboer');

      cy.findByLabelText('Samboers fødselsnummer eller d-nummer').should('not.exist');
      cy.findByRole('textbox', { name: /Samboers fødselsdato/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Hva er din samboers statsborgerskap/ }).should('not.exist');

      selectRadio('Har din samboer norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByLabelText('Samboers fødselsnummer eller d-nummer').should('exist');

      selectRadio('Har din samboer norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Samboers fødselsnummer eller d-nummer').should('not.exist');
      cy.findByRole('textbox', { name: /Samboers fødselsdato/ }).should('exist');

      selectRadio('Er din samboer utenlandsk statsborger?', 'Ja');
      cy.findByRole('textbox', { name: /Hva er din samboers statsborgerskap/ }).should('exist');

      selectRadio('Er din samboer utenlandsk statsborger?', 'Nei');
      cy.findByRole('textbox', { name: /Hva er din samboers statsborgerskap/ }).should('not.exist');
    });
  });

  describe('Arbeid conditionals', () => {
    it('shows the arbeid branches and toggles the downstream arbeid questions', () => {
      visitPanel('veiledning');
      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare/ }).click();
      selectRadio('Er du i arbeid nå?', 'Ja');
      selectRadio('Er du næringsdrivende?', 'Ja');
      selectRadio('Driver du gårdsbruk?', 'Nei');

      clickStepperLink('Arbeid');

      cy.findByLabelText('Mottar du fostergodtgjørelse eller omsorgslønn?').should('exist');
      cy.findByLabelText('Er du ansatt i egen bedrift/aksjeselskap?').should('exist');
      cy.findByRole('textbox', { name: 'Arbeidsgivers navn' }).should('not.exist');
      cy.findByLabelText('Har du avsluttet næringsvirksomheten?').should('not.exist');
      cy.findByLabelText('Hvilket årstall avtjente du militær eller sivil førstegangstjeneste?').should('not.exist');

      selectRadio('Var du arbeidstaker da du ble syk?', 'Ja');
      cy.findByRole('textbox', { name: 'Arbeidsgivers navn' }).should('exist');

      selectRadio('Var du arbeidstaker da du ble syk?', 'Nei');
      cy.findByRole('textbox', { name: 'Arbeidsgivers navn' }).should('not.exist');

      selectRadio('Var du næringsdrivende eller gårdbruker da du ble syk?', 'Ja');
      cy.findByLabelText('Har du avsluttet næringsvirksomheten?').should('exist');

      selectRadio('Har du avtjent militær eller sivil førstegangstjeneste?', 'Ja');
      cy.findByLabelText('Hvilket årstall avtjente du militær eller sivil førstegangstjeneste?').should('exist');
    });
  });

  describe('Utenlandsopphold conditionals', () => {
    it('toggles the foreign-stay datagrids and citizenship field', () => {
      visitPanel('utenlandsopphold');

      cy.findByLabelText('Oppholdsland').should('not.exist');
      cy.findByRole('textbox', { name: 'Statsborgerskap' }).should('not.exist');
      cy.findByLabelText('Land du mottar pensjon fra').should('not.exist');

      selectRadio('Har du bodd og/eller arbeidet utenfor Norge etter at du fylte 16 år?', 'Ja');
      cy.findByLabelText('Oppholdsland').should('exist');

      selectRadio('Er du norsk statsborger?', 'Nei');
      cy.findByRole('textbox', { name: 'Statsborgerskap' }).should('exist');

      selectRadio('Mottar du pensjon fra utlandet?', 'Ja');
      cy.findByLabelText('Land du mottar pensjon fra').should('exist');
    });
  });

  describe('Barn under 18 år conditionals', () => {
    it('switches the parent question between spouse and samboer branches based on civil status', () => {
      visitPanel('sivilstatus');
      selectRadio('Hva er din sivilstatus?', 'Gift eller partner');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Barn under 18 år' }).click();

      selectRadio('Har du barn under 18 år?', 'Ja');
      cy.findByLabelText('Er din ektefelle eller partner forelder til barnet du søker barnetillegg for?').should(
        'exist',
      );
      cy.findByLabelText('Er din samboer forelder til barnet du søker barnetillegg for?').should('not.exist');

      cy.findByRole('link', { name: 'Sivilstatus' }).click();
      selectRadio('Hva er din sivilstatus?', 'Samboer');
      cy.findByRole('link', { name: 'Barn under 18 år' }).click();

      cy.findByLabelText('Er din samboer forelder til barnet du søker barnetillegg for?').should('exist');
      cy.findByLabelText('Er din ektefelle eller partner forelder til barnet du søker barnetillegg for?').should(
        'not.exist',
      );
    });

    it('walks the child identity and custody chain to the bidrag alert', () => {
      visitPanel('barnunder18ar');

      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
      selectRadio('Har du barn under 18 år?', 'Ja');

      cy.findAllByRole('textbox', { name: 'Fornavn' }).first().type('Sara');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).first().type('Barn');

      cy.findByLabelText('Fødselsnummer / D-nummer').should('not.exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Har barnet eller barna legitimasjon med bilde?').should('not.exist');

      selectRadio('Har dette barnet norsk fødselsnummer eller D-nummer?', 'Ja');
      cy.findByLabelText('Fødselsnummer / D-nummer').should('exist');

      selectRadio('Har dette barnet norsk fødselsnummer eller D-nummer?', 'Nei');
      cy.findByLabelText('Fødselsnummer / D-nummer').should('not.exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('exist');
      cy.findByLabelText('Har barnet eller barna legitimasjon med bilde?').should('exist');

      cy.findByLabelText('Har dere avtale om delt bosted etter barneloven § 36?').should('not.exist');
      cy.findByLabelText('Bor barnet med deg?').should('not.exist');
      cy.findByLabelText('Forsørger du barnet?').should('not.exist');
      cy.findByLabelText('Betales det bidrag for barnet via Nav?').should('not.exist');

      selectRadio('Bor barnet og begge foreldrene på samme adresse?', 'Nei');
      cy.findByLabelText('Har dere avtale om delt bosted etter barneloven § 36?').should('exist');

      selectRadio('Har dere avtale om delt bosted etter barneloven § 36?', 'Nei');
      cy.findByLabelText('Bor barnet med deg?').should('exist');

      selectRadio('Bor barnet med deg?', 'Nei');
      cy.findByLabelText('Forsørger du barnet?').should('exist');

      selectRadio('Forsørger du barnet?', 'Ja');
      cy.findByLabelText('Betales det bidrag for barnet via Nav?').should('exist');

      selectRadio('Betales det bidrag for barnet via Nav?', 'Nei');
      cy.contains('må privat forsørgelses- eller samværsavtale vedlegges søknaden').should('exist');
    });
  });

  describe('Egen inntekt conditionals', () => {
    it('shows the panel when applicant has children and toggles the income amount fields', () => {
      visitPanel('utenlandsopphold');
      selectRadio('Mottar du pensjon fra utlandet?', 'Ja');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Barn under 18 år' }).click();
      selectRadio('Har du barn under 18 år?', 'Ja');
      cy.findAllByRole('textbox', { name: 'Fornavn' }).first().type('Sara');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).first().type('Barn');
      selectRadio('Har dette barnet norsk fødselsnummer eller D-nummer?', 'Nei');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).type('01.01.2015');
      selectRadio('Har barnet eller barna legitimasjon med bilde?', 'Nei');
      selectRadio('Bor barnet og begge foreldrene på samme adresse?', 'Ja');
      selectRadio('Er barnet ditt fosterbarn?', 'Nei');

      cy.clickNextStep();
      cy.get('h2#page-title').should('contain.text', 'Egen inntekt');

      incomeConditionals.forEach(({ question, amountLabel }) => {
        cy.findByLabelText(amountLabel).should('not.exist');
        selectRadio(question, 'Ja');
        cy.findByLabelText(amountLabel).should('exist');
        selectRadio(question, 'Nei');
        cy.findByLabelText(amountLabel).should('not.exist');
      });

      cy.findByLabelText('Mottar du pensjon fra utlandet?').should('exist');
      cy.findByLabelText(/Brutto årlig pensjon fra utlandet/).should('not.exist');
      selectRadio('Mottar du pensjon fra utlandet?', 'Ja');
      cy.findByLabelText(/Brutto årlig pensjon fra utlandet/).should('exist');
    });
  });

  describe('Ekstra dokumentasjon til Nav conditionals', () => {
    it('shows the textarea only when applicant has agreed to send more documentation', () => {
      visitPanel('page10');

      cy.findByRole('textbox', { name: /Hvilken dokumentasjon har du avtalt med Nav/ }).should('not.exist');

      selectRadio('Har du avtalt med Nav at du skal sende mer dokumentasjon?', 'Ja');
      cy.findByRole('textbox', { name: /Hvilken dokumentasjon har du avtalt med Nav/ }).should('exist');

      selectRadio('Har du avtalt med Nav at du skal sende mer dokumentasjon?', 'Nei');
      cy.findByRole('textbox', { name: /Hvilken dokumentasjon har du avtalt med Nav/ }).should('not.exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows the work-related attachments when the veiledning and arbeid answers require them', () => {
      visitPanel('veiledning');
      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare/ }).click();
      selectRadio('Er du i arbeid nå?', 'Ja');
      selectRadio('Er du næringsdrivende?', 'Ja');
      selectRadio('Driver du gårdsbruk?', 'Ja');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Arbeid' }).click();
      selectRadio('Var du næringsdrivende eller gårdbruker da du ble syk?', 'Ja');
      selectRadio('Har du avsluttet næringsvirksomheten?', 'Ja');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Inntektsskjema for arbeidstakere - uføretrygd/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon av inntekt|Kopi av siste lønnslipp/ }).should('exist');
      cy.findByRole('group', { name: /Inntektsskjema for gårdbrukere - uføretrygd/ }).should('exist');
      cy.findByRole('group', {
        name: /Inntektsskjema for næringsdrivende og ansatt i eget aksjeselskap - uføretrygd/,
      }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon på avsluttet næringsvirksomhet/ }).should('exist');
    });

    it('shows spouse, child, and agreed-documentation attachments when those branches are triggered', () => {
      visitPanel('sivilstatus');
      selectRadio('Hva er din sivilstatus?', 'Gift eller partner');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Ektefelle eller partner' }).click();
      selectRadio('Har din ektefelle eller partner norsk fødselsnummer eller d-nummer?', 'Nei');

      cy.findByRole('link', { name: 'Barn under 18 år' }).click();
      selectRadio('Har du barn under 18 år?', 'Ja');
      cy.findAllByRole('textbox', { name: 'Fornavn' }).first().type('Sara');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).first().type('Barn');
      selectRadio('Har dette barnet norsk fødselsnummer eller D-nummer?', 'Nei');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).type('01.01.2015');
      selectRadio('Har barnet eller barna legitimasjon med bilde?', 'Ja');
      selectRadio('Bor barnet og begge foreldrene på samme adresse?', 'Nei');
      selectRadio('Har dere avtale om delt bosted etter barneloven § 36?', 'Nei');
      selectRadio('Bor barnet med deg?', 'Nei');
      selectRadio('Forsørger du barnet?', 'Ja');
      selectRadio('Betales det bidrag for barnet via Nav?', 'Nei');
      selectRadio('Er barnet ditt fosterbarn?', 'Nei');

      cy.findByRole('link', { name: 'Ekstra dokumentasjon til Nav' }).click();
      selectRadio('Har du avtalt med Nav at du skal sende mer dokumentasjon?', 'Ja');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', {
        name: /Pass\/ID-papirer|Pass eller vigselsattest til din ektefelle eller partner/,
      }).should('exist');
      cy.findByRole('group', { name: /Fødselsattest|Kopi av fødselsattest/ }).should('exist');
      cy.findByRole('group', { name: /Pass\/ID-papirer|Kopi av barnets legitimasjon/ }).should('exist');
      cy.findByRole('group', { name: /Avtale om samvær|Forsørgelses- eller samværsavtale/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon som er avtalt med Nav/ }).should('exist');
    });
  });

  describe('Summary', () => {
    it('fills the minimum path and verifies the summary', () => {
      visitPanel('veiledning');

      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare/ }).click();
      selectRadio('Er du i arbeid nå?', 'Nei');
      selectRadio('Er du næringsdrivende?', 'Nei');
      selectRadio('Driver du gårdsbruk?', 'Nei');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Dine opplysninger' }).click();
      cy.get('h2#page-title').should('contain.text', 'Dine opplysninger');

      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('link', { name: 'Sivilstatus' }).click();
      cy.get('h2#page-title').should('contain.text', 'Sivilstatus');

      selectRadio('Hva er din sivilstatus?', 'Enslig');
      cy.findByRole('link', { name: 'Arbeid' }).click();
      cy.get('h2#page-title').should('contain.text', 'Arbeid');

      selectRadio('Var du arbeidstaker da du ble syk?', 'Nei');
      selectRadio('Var du næringsdrivende eller gårdbruker da du ble syk?', 'Nei');
      selectRadio('Har du avtjent militær eller sivil førstegangstjeneste?', 'Nei');
      cy.findByRole('link', { name: 'Utenlandsopphold' }).click();
      cy.get('h2#page-title').should('contain.text', 'Utenlandsopphold');

      selectRadio('Har du bodd og/eller arbeidet utenfor Norge etter at du fylte 16 år?', 'Nei');
      selectRadio('Er du norsk statsborger?', 'Ja');
      selectRadio('Mottar du pensjon fra utlandet?', 'Nei');
      cy.findByRole('link', { name: 'Yrkesskade og yrkessykdom' }).click();
      cy.get('h2#page-title').should('contain.text', 'Yrkesskade og yrkessykdom');

      selectRadio(
        /Har du en godkjent yrkesskade eller yrkessykdom, som er årsak til at du søker om uføretrygd\?/,
        'Nei',
      );
      cy.findByRole('link', { name: 'Barn under 18 år' }).click();
      cy.get('h2#page-title').should('contain.text', 'Barn under 18 år');

      selectRadio('Har du barn under 18 år?', 'Nei');
      cy.findByRole('link', { name: 'Bor utenfor Norge og EØS' }).click();
      cy.get('h2#page-title').should('contain.text', 'Bor utenfor Norge og EØS');

      selectRadio('Bor du utenfor Norge eller EØS?', 'Nei');
      cy.findByRole('link', { name: 'Ekstra dokumentasjon til Nav' }).click();
      cy.get('h2#page-title').should('contain.text', 'Ekstra dokumentasjon til Nav');

      selectRadio('Har du avtalt med Nav at du skal sende mer dokumentasjon?', 'Nei');
      cy.findByRole('link', { name: 'Erklæring' }).click();
      cy.get('h2#page-title').should('contain.text', 'Erklæring');

      cy.findByRole('checkbox', { name: /Jeg er kjent med at Nav kan innhente de opplysningene/ }).click();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.get('h2#page-title').should('contain.text', 'Vedlegg');

      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Veiledning', () => {
        cy.contains('dt', 'Er du i arbeid nå?').next('dd').should('contain.text', 'Nei');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Sivilstatus', () => {
        cy.contains('dt', 'Hva er din sivilstatus?').next('dd').should('contain.text', 'Enslig');
      });
    });
  });
});
