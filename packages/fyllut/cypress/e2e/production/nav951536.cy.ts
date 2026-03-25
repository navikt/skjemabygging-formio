import nav951536Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav951536.json';

/*
 * Production form tests for Generell fullmakt
 * Form: nav951536
 * Submission types: PAPER, DIGITAL_NO_LOGIN
 *
 * Panels tested:
 *   - Den fullmektige (denFullmektige): 4 same-panel conditionals
 *       confirmation checkboxes → fullmektig details group
 *       harDenFullmektigeNorskFodselsnummerEllerDNummer1 → fullmektigSittfodselsnummerDNummer / fullmektigSinfodselsdatoDdMmAaaa1
 *       denFullmektigeHarIkkeTelefonnummer → telefonnummer2 visibility
 *       erKontaktadressenTilDenFullmektigeEnVegadresseEllerPostboksadresse → norskVegadresse1 / norskPostboksadresse1
 *   - Dine opplysninger (dineOpplysninger): 3 same-panel conditionals
 *       identitet → adresse / alert visibility
 *       adresse → without Norwegian address fields, foreign address fields are shown
 *       jegHarIkkeTelefonnummer → telefonnummer visibility
 *   - Periode for fullmakten (periodeForFullmakten): 1 same-panel conditional
 *       onskerDuATidsbegrenseFullmakten → tilDatoDdMmAaaa
 *   - Fullmakten gjelder (fullmaktenGjelder): 6 same-panel conditionals
 *       hovedomrade selectboxes → arbeid/familie/hjelpemidler/pensjon/ovrig groups
 *       subgroup "velg alle" checkboxes → detailed selectboxes hidden + alertstripe shown
 *   - Vedlegg (vedlegg): no conditionals, but isAttachmentPanel=true
 */

const formatDate = (date: Date) =>
  `${`${date.getDate()}`.padStart(2, '0')}.${`${date.getMonth() + 1}`.padStart(2, '0')}.${date.getFullYear()}`;

const formPath = 'nav951536';

const confirmFullmaktsgiverRequirements = () => {
  cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg som fullmaktsgiver er over 18 år/ }).click();
  cy.findByRole('checkbox', {
    name: /Jeg bekrefter at personen jeg skal gi fullmakt til er 18 år eller eldre/,
  }).click();
  cy.findByRole('checkbox', {
    name: /Jeg bekrefter at personen jeg skal gi fullmakt til ikke er ansatt i Nav/,
  }).click();
};

describe('nav951536', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
    cy.intercept('GET', `/fyllut/api/forms/${formPath}*`, { body: nav951536Form }).as('getForm');
    cy.intercept('GET', `/fyllut/api/translations/${formPath}*`, { body: {} }).as('getTranslations');
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: {} });
  });

  describe('Den fullmektige conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav951536/denFullmektige?sub=paper');
      cy.defaultWaits();
    });

    it('reveals fullmektig details only after all confirmation checkboxes are checked', () => {
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');

      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg som fullmaktsgiver er over 18 år/ }).click();
      cy.findByRole('checkbox', {
        name: /Jeg bekrefter at personen jeg skal gi fullmakt til er 18 år eller eldre/,
      }).click();
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');

      cy.findByRole('checkbox', {
        name: /Jeg bekrefter at personen jeg skal gi fullmakt til ikke er ansatt i Nav/,
      }).click();

      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('exist');
      cy.findByLabelText('Har den fullmektige norsk fødselsnummer eller d-nummer?').should('exist');
    });

    it('toggles identity, phone and address variants for the fullmektig', () => {
      confirmFullmaktsgiverRequirements();

      cy.findByRole('textbox', { name: /Fullmektig sitt fødselsnummer eller d-nummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Fullmektig sin fødselsdato/ }).should('not.exist');

      cy.withinComponent('Har den fullmektige norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Fullmektig sitt fødselsnummer eller d-nummer/i }).should('exist');
      cy.findByRole('textbox', { name: /Fullmektig sin fødselsdato/ }).should('not.exist');

      cy.withinComponent('Har den fullmektige norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Fullmektig sitt fødselsnummer eller d-nummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Fullmektig sin fødselsdato/ }).should('exist');

      cy.findByLabelText('Telefonnummer').should('exist');
      cy.findByRole('checkbox', { name: /Den fullmektige har ikke telefonnummer/ }).click();
      cy.findByLabelText('Telefonnummer').should('not.exist');
      cy.findByRole('checkbox', { name: /Den fullmektige har ikke telefonnummer/ }).click();
      cy.findByLabelText('Telefonnummer').should('exist');

      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Er kontaktadressen til den fullmektige en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });

      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Er kontaktadressen til den fullmektige en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Postboksadresse' }).click();
      });

      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
    });
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav951536/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows foreign identity and address fields when the applicant has no Norwegian identity number', () => {
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, eller postboks/ }).should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('exist');
      cy.findByLabelText('Bor du i Norge?').should('exist');
      cy.contains('Du trenger ikke å oppgi adresse').should('not.exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Vegnavn og husnummer, eller postboks/ }).should('exist');
      cy.findByRole('textbox', { name: /Postnummer/ }).should('exist');
      cy.findByRole('textbox', { name: /By \/ stedsnavn/ }).should('exist');
      cy.findByRole('combobox', { name: 'Land' }).should('exist');
    });

    it('hides the applicant phone field when the no-phone checkbox is checked', () => {
      cy.findByLabelText('Telefonnummer').should('exist');

      cy.findByRole('checkbox', { name: /Jeg har ikke telefonnummer/ }).click();
      cy.findByLabelText('Telefonnummer').should('not.exist');

      cy.findByRole('checkbox', { name: /Jeg har ikke telefonnummer/ }).click();
      cy.findByLabelText('Telefonnummer').should('exist');
    });
  });

  describe('Periode for fullmakten conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav951536/periodeForFullmakten?sub=paper');
      cy.defaultWaits();
    });

    it('shows the to-date field only when the fullmakt is time-limited', () => {
      cy.findByRole('textbox', { name: /Fullmakten gjelder til og med dato/ }).should('not.exist');

      cy.withinComponent('Ønsker du å tidsbegrense fullmakten?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Fullmakten gjelder til og med dato/ }).should('exist');

      cy.withinComponent('Ønsker du å tidsbegrense fullmakten?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Fullmakten gjelder til og med dato/ }).should('not.exist');
    });
  });

  describe('Fullmakten gjelder conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav951536/fullmaktenGjelder?sub=paper');
      cy.defaultWaits();
    });

    it('shows area-specific groups when main areas are selected', () => {
      cy.findByRole('checkbox', { name: 'Jeg velger alle områdene som gjelder arbeid.' }).should('not.exist');
      cy.findByRole('checkbox', { name: 'Jeg velger alle områdene som gjelder pensjon.' }).should('not.exist');

      cy.findByRole('group', { name: 'Velg hvilke hovedområder i Nav personen skal kunne representere deg på' }).within(
        () => {
          cy.findByRole('checkbox', { name: 'Arbeid' }).check();
          cy.findByRole('checkbox', { name: 'Pensjon' }).check();
        },
      );

      cy.findByRole('checkbox', { name: /Jeg velger alle områdene som gjelder arbeid/ }).should('exist');
      cy.findByRole('checkbox', { name: /Jeg velger alle områdene som gjelder pensjon/ }).should('exist');
      cy.findByRole('checkbox', { name: /Jeg velger alle områdene som gjelder familie/ }).should('not.exist');
      cy.findByLabelText('Velg hvilke områder innenfor arbeid fullmakten gjelder').should('exist');
      cy.findByLabelText('Velg hvilke områder innenfor pensjon fullmakten gjelder').should('exist');
    });

    it('hides detailed area checkboxes when choose-all is selected for a subgroup', () => {
      cy.findByRole('group', { name: 'Velg hvilke hovedområder i Nav personen skal kunne representere deg på' }).within(
        () => {
          cy.findByRole('checkbox', { name: 'Arbeid' }).check();
        },
      );

      cy.findByLabelText('Velg hvilke områder innenfor arbeid fullmakten gjelder').should('exist');
      cy.findByRole('checkbox', { name: 'Dagpenger' }).should('exist');

      cy.findByRole('checkbox', { name: /Jeg velger alle områdene som gjelder arbeid/ }).click();

      cy.findByLabelText('Velg hvilke områder innenfor arbeid fullmakten gjelder').should('not.exist');
      cy.findByRole('checkbox', { name: 'Dagpenger' }).should('not.exist');

      cy.findByRole('checkbox', { name: /Jeg velger alle områdene som gjelder arbeid/ }).click();

      cy.findByLabelText('Velg hvilke områder innenfor arbeid fullmakten gjelder').should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav951536/denFullmektige?sub=paper');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary', () => {
      const today = new Date();
      const fromDate = formatDate(today);

      confirmFullmaktsgiverRequirements();
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Fullmektig');
      cy.withinComponent('Har den fullmektige norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Fullmektig sitt fødselsnummer eller d-nummer/i }).type('17912099997');
      cy.findByRole('checkbox', { name: /Den fullmektige har ikke telefonnummer/ }).click();
      cy.withinComponent('Er kontaktadressen til den fullmektige en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).type('Fullmaktsveien 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0150');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.clickNextStep();

      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      cy.findByRole('textbox', { name: /Fullmakten gjelder fra og med dato/ }).type(fromDate);
      cy.withinComponent('Ønsker du å tidsbegrense fullmakten?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.withinComponent('Velg hva personen skal kunne gjøre på vegne av deg', () => {
        cy.findByRole('radio', { name: /Lese og snakke$/ }).click();
      });
      cy.findByRole('group', { name: 'Velg hvilke hovedområder i Nav personen skal kunne representere deg på' }).within(
        () => {
          cy.findByRole('checkbox', { name: 'Arbeid' }).check();
        },
      );
      cy.findByRole('checkbox', { name: /Jeg velger alle områdene som gjelder arbeid/ }).click();
      cy.clickNextStep();

      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');

      cy.withinSummaryGroup('Den fullmektige', () => {
        cy.contains('dt', 'Fornavn').should('exist');
        cy.contains('dd', 'Kari').should('exist');
      });

      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').should('exist');
        cy.contains('dd', 'Ola').should('exist');
      });

      cy.withinSummaryGroup('Periode for fullmakten', () => {
        cy.contains('dt', 'Fullmakten gjelder fra og med dato').should('exist');
        cy.contains('dd', fromDate).should('exist');
      });

      cy.withinSummaryGroup('Fullmakten gjelder', () => {
        cy.contains('dd', 'Lese og snakke').should('exist');
        cy.contains('dd', 'Arbeid').should('exist');
      });
    });
  });
});
