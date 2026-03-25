/*
 * Production form tests for Søknad om ektefellebidrag
 * Form: nav530005
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Kravet (kravet): 6 same-panel / cross-panel conditionals
 *       samtykkerDuIAtKravetAvgjoresAvBidragsfogden → alertstripe, kravetGjelder2
 *       kravetGjelder2 + fastsettelseAvBidrag/endringAvBidrag → date and currency fields
 *       hvilkenPartErDuISaken + kravetGjelder2 → innkreving date
 *       samtykkerDuIAtKravetAvgjoresAvBidragsfogden + kravetGjelder2 → date panel branches
 *   - Dine opplysninger (dineOpplysninger): 6 same-panel conditionals
 *       harDuNorskFodselsnummerEllerDNummer / borDuINorge / vegadresseEllerPostboksadresse
 *       → fnr, fødselsdato and address groups
 *       harIkkeTelefon → phone visibility
 *   - Motpartens opplysninger (motpartensOpplysninger): 5 same-panel conditionals
 *       harMotpartenNorskFodselsnummerEllerDNummer / borMotpartenINorge / vegadresseEllerPostboksadresse1
 *       → fnr, fødselsdato and address groups
 *   - Datoer for samliv og samlivsbrudd (datoerForSamlivOgSamlivsbrudd): 4 cross-panel / same-panel conditionals
 *       samtykkerDuIAtKravetAvgjoresAvBidragsfogden + kravetGjelder2 → separation questions
 *       erDereFormeltSeparert / erDereFormeltSkilt → date pickers
 *   - Utdanning (utdanning): 1 same-panel conditional
 *       harDuUtdanningUtoverVanligGrunnskole → utdannelse2
 *   - Felles barn (fellesBarn): 3 same-panel conditionals
 *       harParteneFellesBarn → datagrid
 *       fellesBarn.harIkkeNorskFodselsnummerEllerDNummer → fnr / fødselsdato
 *   - Ny ektefelle, samboer og særkullsbarn (nyEktefelleSamboerOgSaerkullsbarn): 4 same-panel conditionals
 *       harDuNyEktefelleSamboer → spouse/cohabitant income question
 *       harDuForsorgedeSaerkullsbarn → datagrid
 *       forsorgedeSaerkullsbarn.harIkkeNorskFodselsnummerEllerDNummer → fnr / fødselsdato
 *   - Vedlegg (vedlegg): 3 cross-panel attachment conditionals
 *       kravetGjelder2 / samtykkerDuIAtKravetAvgjoresAvBidragsfogden → marriage-date attachment
 *       kravetGjelder2=endring → previous-agreement attachment
 */

const visitWithFreshState = (url: string) => {
  cy.visit(url, {
    onBeforeLoad: (win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    },
  });
  cy.defaultWaits();
};

const selectRadio = (label: string, option: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const openKravetFromPart = (part: 'Bidragsmottaker' | 'Bidragpliktige') => {
  visitWithFreshState('/fyllut/nav530005/partISaken?sub=paper');
  selectRadio('Hvilken part er du i saken?', part);
  cy.clickNextStep();
};

const chooseKrav = (krav: 'Fastsettelse' | 'Endring' | 'Innkreving') => {
  selectRadio('Samtykker du i at kravet avgjøres av NAV?', 'Ja');
  selectRadio('Hva gjelder kravet?', krav);
};

const fillApplicantMinimum = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /Fødselsnummer \/ D-nummer/i }).type('17912099997');
  selectRadio('Bor du i Norge?', 'Nei');
  cy.findByLabelText('Telefonnummer').type('12345678');
  cy.clickNextStep();
};

const fillMotpartMinimum = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  selectRadio('Har motparten norsk fødselsnummer eller D-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /Motpartens fødselsnummer \/ D-nummer/i }).type('17912099997');
  selectRadio('Bor motparten i Norge?', 'Nei');
  cy.findByLabelText('Telefonnummer').type('12345678');
  cy.clickNextStep();
};

const goToPanelAfterMotpart = (
  krav: 'Fastsettelse' | 'Innkreving',
  expectedTitle: 'Datoer for samliv og samlivsbrudd' | 'Vedlegg' = 'Datoer for samliv og samlivsbrudd',
) => {
  openKravetFromPart('Bidragsmottaker');
  chooseKrav(krav);

  if (krav === 'Fastsettelse') {
    cy.findByRole('group', {
      name: /Velg hva hva kravet gjelder, vedr\.\s+fastsettelse av bidrag/,
    }).within(() => {
      cy.findByRole('checkbox', { name: 'Ingen krav om bidragets størrelse' }).check();
    });
  } else {
    cy.findByRole('textbox', { name: /Innkreving av bidrag fra dato/ }).type('01.01.2024');
  }

  cy.clickNextStep();
  fillApplicantMinimum();
  fillMotpartMinimum();
  cy.get('#page-title').should('contain.text', expectedTitle);
};

describe('nav530005', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Kravet conditionals', () => {
    it('toggles guidance alert and krav question from samtykke answer', () => {
      visitWithFreshState('/fyllut/nav530005/kravet?sub=paper');

      cy.contains(/setter seg mot at NAV avgjør kravet/i).should('not.exist');
      cy.findByLabelText('Hva gjelder kravet?').should('not.exist');

      selectRadio('Samtykker du i at kravet avgjøres av NAV?', 'Nei');
      cy.contains(/setter seg mot at NAV avgjør kravet/i).should('exist');
      cy.findByLabelText('Hva gjelder kravet?').should('not.exist');

      selectRadio('Samtykker du i at kravet avgjøres av NAV?', 'Ja');
      cy.contains(/setter seg mot at NAV avgjør kravet/i).should('not.exist');
      cy.findByLabelText('Hva gjelder kravet?').should('exist');
    });

    it('shows fastsettelse fields only for selected checkbox branches', () => {
      visitWithFreshState('/fyllut/nav530005/kravet?sub=paper');

      chooseKrav('Fastsettelse');

      cy.findByRole('group', {
        name: /Velg hva hva kravet gjelder, vedr\.\s+fastsettelse av bidrag/,
      }).should('exist');
      cy.findByRole('group', { name: /vedr\. endring av bidrag/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Bidrag fra dato/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Bidrag per måned/ }).should('not.exist');

      cy.findByRole('group', {
        name: /Velg hva hva kravet gjelder, vedr\.\s+fastsettelse av bidrag/,
      }).within(() => {
        cy.findByRole('checkbox', { name: 'Utbetaling av bidrag fra dato' }).check();
        cy.findByRole('checkbox', { name: 'Bidragets størrelse per måned' }).check();
      });

      cy.findByRole('textbox', { name: /Bidrag fra dato/ }).should('exist');
      cy.findByRole('textbox', { name: /Bidrag per måned/ }).should('exist');

      cy.findByRole('group', {
        name: /Velg hva hva kravet gjelder, vedr\.\s+fastsettelse av bidrag/,
      }).within(() => {
        cy.findByRole('checkbox', { name: 'Utbetaling av bidrag fra dato' }).uncheck();
        cy.findByRole('checkbox', { name: 'Bidragets størrelse per måned' }).uncheck();
      });

      cy.findByRole('textbox', { name: /Bidrag fra dato/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Bidrag per måned/ }).should('not.exist');
    });
  });

  describe('Kravet cross-panel conditionals', () => {
    it('shows innkreving date only for bidragsmottaker with innkreving', () => {
      openKravetFromPart('Bidragsmottaker');

      chooseKrav('Innkreving');
      cy.findByRole('textbox', { name: /Innkreving av bidrag fra dato/ }).should('exist');

      openKravetFromPart('Bidragpliktige');
      chooseKrav('Innkreving');
      cy.findByRole('textbox', { name: /Innkreving av bidrag fra dato/ }).should('not.exist');
    });

    it('shows separation questions on date panel for fastsettelse but not for innkreving', () => {
      goToPanelAfterMotpart('Fastsettelse');
      cy.findByLabelText('Er dere formelt separert?').should('exist');
      cy.findByLabelText('Er dere formelt skilt?').should('exist');

      goToPanelAfterMotpart('Innkreving', 'Vedlegg');
      cy.get('#page-title').should('contain.text', 'Vedlegg');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Datoer for samliv og samlivsbrudd' }).should('not.exist');
    });
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav530005/dineOpplysninger?sub=paper');
    });

    it('switches between fnr, Norwegian address, and foreign address branches', () => {
      cy.findByRole('textbox', { name: /Fødselsnummer \/ D-nummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /Fødselsnummer \/ D-nummer/i }).should('exist');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).should('exist');

      selectRadio('Bor du i Norge?', 'Ja');
      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('exist');
      cy.findByRole('textbox', { name: 'Bostedskommune' }).should('exist');

      selectRadio('Er kontaktadressen din en vegadresse eller postboksadresse?', 'Vegadresse');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      selectRadio('Er kontaktadressen din en vegadresse eller postboksadresse?', 'Postboksadresse');
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');

      selectRadio('Bor du i Norge?', 'Nei');
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: 'Bostedskommune' }).should('not.exist');
    });

    it('hides phone input when har ikke telefon is checked', () => {
      cy.findByLabelText('Telefonnummer').should('exist');
      cy.findByRole('checkbox', { name: /Har ikke telefon/ }).click();
      cy.findByLabelText('Telefonnummer').should('not.exist');
    });
  });

  describe('Motpartens opplysninger conditionals', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav530005/motpartensOpplysninger?sub=paper');
    });

    it('switches between fnr, Norwegian address, and foreign address branches for motpart', () => {
      cy.findByRole('textbox', { name: /Motpartens fødselsnummer \/ D-nummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Moltpartens fødselsdato/ }).should('not.exist');

      selectRadio('Har motparten norsk fødselsnummer eller D-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /Motpartens fødselsnummer \/ D-nummer/i }).should('exist');

      selectRadio('Har motparten norsk fødselsnummer eller D-nummer?', 'Nei');
      cy.findByRole('textbox', { name: /Moltpartens fødselsdato/ }).should('exist');

      selectRadio('Bor motparten i Norge?', 'Ja');
      cy.findByLabelText('Er motpartens kontaktadresse en vegadresse eller postboksadresse?').should('exist');
      cy.findByRole('textbox', { name: 'Motpartens bostedskommune' }).should('exist');

      selectRadio('Er motpartens kontaktadresse en vegadresse eller postboksadresse?', 'Vegadresse');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');

      selectRadio('Bor motparten i Norge?', 'Nei');
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: 'Motpartens bostedskommune' }).should('not.exist');
    });
  });

  describe('Datoer, utdanning, barn and spouse conditionals', () => {
    it('toggles separation date fields from date panel questions', () => {
      goToPanelAfterMotpart('Fastsettelse');

      cy.findByRole('textbox', { name: /Dato for formell separasjon/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Dato for formell skilsmisse/ }).should('not.exist');

      selectRadio('Er dere formelt separert?', 'Ja');
      cy.findByRole('textbox', { name: /Dato for formell separasjon/ }).should('exist');

      selectRadio('Er dere formelt skilt?', 'Ja');
      cy.findByRole('textbox', { name: /Dato for formell skilsmisse/ }).should('exist');
    });

    it('toggles follow-up fields for education, children and new spouse panels', () => {
      visitWithFreshState('/fyllut/nav530005/utdanning?sub=paper');
      cy.findByRole('textbox', { name: 'Høyeste utdanning utover vanlig grunnskole' }).should('not.exist');
      selectRadio('Har du utdanning utover vanlig grunnskole?', 'Ja');
      cy.findByRole('textbox', { name: 'Høyeste utdanning utover vanlig grunnskole' }).should('exist');

      visitWithFreshState('/fyllut/nav530005/fellesBarn?sub=paper');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
      selectRadio('Har partene felles barn?', 'Ja');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: /Fødselsnummer \/ D-nummer/i }).should('exist');
      cy.findByRole('checkbox', { name: /Barnet har ikke\s+norsk fødselsnummer eller D-nummer/ }).click();
      cy.findByRole('textbox', { name: /Fødselsnummer \/ D-nummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /^Fødselsdato/ }).should('exist');

      visitWithFreshState('/fyllut/nav530005/nyEktefelleSamboerOgSaerkullsbarn?sub=paper');
      cy.findByLabelText('Har ny ektefelle inntekt?').should('not.exist');
      cy.findByLabelText('Har samboer inntekt?').should('not.exist');

      selectRadio('Har du ny ektefelle/samboer?', 'Ja, ny ektefelle');
      cy.findByLabelText('Har ny ektefelle inntekt?').should('exist');
      cy.findByLabelText('Har samboer inntekt?').should('not.exist');

      selectRadio('Har du ny ektefelle/samboer?', 'Ja, samboer');
      cy.findByLabelText('Har samboer inntekt?').should('exist');
      cy.findByLabelText('Har ny ektefelle inntekt?').should('not.exist');

      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
      selectRadio('Har du forsørgede særkullsbarn?', 'Ja');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('checkbox', { name: /Barnet har ikke\s+norsk fødselsnummer eller D-nummer/ }).click();
      cy.findByRole('textbox', { name: /Fødselsnummer \/ D-nummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Førselsdato/ }).should('exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows marriage attachment for fastsettelse and hides it for innkreving', () => {
      openKravetFromPart('Bidragsmottaker');
      chooseKrav('Fastsettelse');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /ekteskapsinngåelse/i }).should('exist');

      openKravetFromPart('Bidragsmottaker');
      chooseKrav('Innkreving');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /ekteskapsinngåelse/i }).should('not.exist');
    });

    it('shows previous agreement attachment for endring', () => {
      openKravetFromPart('Bidragsmottaker');
      chooseKrav('Endring');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /tidligere avtale|vedtak eller avtale om bidrag/i }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav530005?sub=paper');
    });

    it('fills required fields and verifies summary', () => {
      cy.clickNextStep();
      cy.clickNextStep();

      // Part i saken
      selectRadio('Hvilken part er du i saken?', 'Bidragsmottaker');
      cy.clickNextStep();

      // Kravet
      selectRadio('Samtykker du i at kravet avgjøres av NAV?', 'Ja');
      selectRadio('Hva gjelder kravet?', 'Fastsettelse');
      cy.findByRole('group', {
        name: /Velg hva hva kravet gjelder, vedr\.\s+fastsettelse av bidrag/,
      }).within(() => {
        cy.findByRole('checkbox', { name: 'Ingen krav om bidragets størrelse' }).check();
      });
      cy.clickNextStep();

      // Dine opplysninger
      fillApplicantMinimum();

      // Motpartens opplysninger
      fillMotpartMinimum();

      // Datoer for samliv og samlivsbrudd
      cy.findByRole('textbox', { name: /Dato for ekteskapsinngåelse/ }).type('01.01.2010');
      cy.findByRole('textbox', { name: /Dato for faktisk samlivsbrudd/ }).type('01.01.2020');
      selectRadio('Er dere formelt separert?', 'Nei');
      selectRadio('Er dere formelt skilt?', 'Nei');
      cy.clickNextStep();

      // Utdanning
      selectRadio('Har du utdanning utover vanlig grunnskole?', 'Nei');
      cy.clickNextStep();

      // Felles barn
      selectRadio('Har partene felles barn?', 'Nei');
      cy.clickNextStep();

      // Ny ektefelle, samboer og særkullsbarn
      selectRadio('Har du ny ektefelle/samboer?', 'Nei');
      selectRadio('Har du forsørgede særkullsbarn?', 'Nei');

      // Vedlegg
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /ekteskapsinngåelse/i }).within(() => {
        cy.findByRole('radio', { name: /ettersender/i }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon|Annet/i }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/i }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Kravet', () => {
        cy.contains('dt', 'Hva gjelder kravet?').next('dd').should('contain.text', 'Fastsettelse');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Motpartens opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Kari');
      });
    });
  });
});
