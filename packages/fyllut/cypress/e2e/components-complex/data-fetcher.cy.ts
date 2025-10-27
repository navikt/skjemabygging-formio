import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';

describe('Data fetcher', () => {
  const LABEL_AKTIVITETSVELGER = 'Aktivitetsvelger';

  before(() => {
    cy.configMocksServer();
    cy.defaultIntercepts();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Rendering', () => {
    describe('dataFetcher outside container', () => {
      it('should render component when data exists', () => {
        cy.mocksUseRouteVariant('get-register-data-activities:success');
        cy.visit('/fyllut/datafetchertest/arbeidsrettetaktivitet?sub=digital');
        cy.findByRole('group', { name: LABEL_AKTIVITETSVELGER })
          .should('exist')
          .within(() => {
            cy.findAllByRole('checkbox').should('have.length', 3);
          });
      });

      it('should not render component when data is empty', () => {
        cy.mocksUseRouteVariant('get-register-data-activities:success-empty');
        cy.visit('/fyllut/datafetchertest/arbeidsrettetaktivitet?sub=digital');
        cy.findByRole('group', { name: LABEL_AKTIVITETSVELGER }).should('not.exist');
        cy.get('.navds-alert--warning').contains('Ingen aktiviteter ble hentet');
      });

      it('should not render component when backend fails', () => {
        cy.mocksUseRouteVariant('get-register-data-activities:error');
        cy.visit('/fyllut/datafetchertest/arbeidsrettetaktivitet?sub=digital');
        cy.findByRole('group', { name: LABEL_AKTIVITETSVELGER }).should('not.exist');
        cy.get('.navds-alert--error').contains('Kall for å hente aktiviteter feilet');
      });
    });

    describe('dataFetcher inside container', () => {
      it('should render component when data exists', () => {
        cy.mocksUseRouteVariant('get-register-data-activities:success');
        cy.visit('/fyllut/datafetchercontainer/aktivitetsoversikt?sub=digital');
        cy.get('.navds-alert--info').contains('Aktiviteter er hentet');
        cy.findByRole('group', { name: LABEL_AKTIVITETSVELGER })
          .should('exist')
          .within(() => {
            cy.findAllByRole('checkbox').should('have.length', 3);
          });
      });

      it('should not render component when data is empty', () => {
        cy.mocksUseRouteVariant('get-register-data-activities:success-empty');
        cy.visit('/fyllut/datafetchercontainer/aktivitetsoversikt?sub=digital');
        cy.get('.navds-alert--info').contains('Aktiviteter er hentet');
        cy.findByRole('group', { name: LABEL_AKTIVITETSVELGER }).should('not.exist');
      });

      it('should not render component when backend fails', () => {
        cy.mocksUseRouteVariant('get-register-data-activities:error');
        cy.visit('/fyllut/datafetchercontainer/aktivitetsoversikt?sub=digital');
        cy.get('.navds-alert--error').contains('Kall for å hente aktiviteter feilet');
        cy.findByRole('group', { name: LABEL_AKTIVITETSVELGER }).should('not.exist');
      });
    });
  });

  describe('Annet option', () => {
    describe('When API returns list containing data', () => {
      beforeEach(() => {
        cy.mocksUseRouteVariant('get-register-data-activities:success');
        cy.visit('/fyllut/datafetcherannettest/arbeidsrettetaktivitet?sub=digital');
      });

      it('renders annet option when showOther is checked', () => {
        cy.findByRole('group', { name: LABEL_AKTIVITETSVELGER })
          .should('exist')
          .within(() => {
            cy.findAllByRole('checkbox').should('have.length', 4);
            cy.findByRole('checkbox', { name: 'Annet' }).should('exist');
          });
      });

      it('selects annet option on click', () => {
        cy.get('.navds-alert--warning').should('not.exist');
        cy.findByRole('checkbox', { name: 'Annet' }).should('exist').check();
        cy.get('.navds-alert--warning').contains('Du har valgt annen aktivitet');
      });
    });

    it('should not render annet option when showOther is checked and API returns empty list', () => {
      cy.mocksUseRouteVariant('get-register-data-activities:success-empty');
      cy.visit('/fyllut/datafetcherannettest/arbeidsrettetaktivitet?sub=digital');
      cy.findByRole('group', { name: LABEL_AKTIVITETSVELGER }).should('not.exist');
      cy.get('.navds-alert--warning').contains('Ingen aktiviteter ble hentet');
    });
  });

  describe('Validation errors', () => {
    beforeEach(() => {
      cy.mocksRestoreRouteVariants();
    });

    it('should display validation error', () => {
      cy.visit('/fyllut/datafetchertest/arbeidsrettetaktivitet?sub=digital');
      cy.clickSaveAndContinue();

      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Du må fylle ut: Aktivitetsvelger' }).should('exist').click();
        });

      cy.findByRole('group', { name: LABEL_AKTIVITETSVELGER })
        .should('exist')
        .should('have.focus')
        .within(() => {
          cy.findByRole('checkbox', { name: 'Aktivitet 1' }).should('exist').check();
        });
      cy.get('[data-cy=error-summary]').should('not.exist');
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
    });

    it('should not display validation error when data is empty', () => {
      cy.mocksUseRouteVariant('get-register-data-activities:success-empty');
      cy.visit('/fyllut/datafetchertest/arbeidsrettetaktivitet?sub=digital');
      cy.clickSaveAndContinue();
      cy.findByRole('link', { name: `Du må fylle ut: Aktivitetsvelger` }).should('not.exist');
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
    });

    it('should disregard required validation when fetch fails', () => {
      cy.mocksUseRouteVariant('get-register-data-activities:error');

      cy.visit('/fyllut/datafetchertest/arbeidsrettetaktivitet?sub=digital');
      cy.get('.navds-alert--error').contains('Kall for å hente aktiviteter feilet');

      cy.clickSaveAndContinue();
      cy.findByRole('link', { name: `Du må fylle ut: Aktivitetsvelger` }).should('not.exist');
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
    });
  });

  describe('Conditionals', () => {
    beforeEach(() => {
      cy.mocksRestoreRouteVariants();
      cy.defaultIntercepts();
      cy.visit('/fyllut/datafetchertest/arbeidsrettetaktivitet?sub=digital');
      cy.defaultWaits();
    });

    it('should show component with conditional referring to checked item', () => {
      cy.get('.navds-alert--info').should('not.exist');
      cy.findByRole('group', { name: LABEL_AKTIVITETSVELGER })
        .should('exist')
        .within(() => {
          cy.findByRole('checkbox', { name: 'Aktivitet 3' }).should('exist').check();
        });
      cy.get('.navds-alert--info').contains('Du har valgt aktivitet med type TILTAK');
    });
  });

  describe('Paper submission', () => {
    beforeEach(() => {
      cy.intercept('GET', '/fyllut/api/register-data/*').as('registerData');
      cy.mocksRestoreRouteVariants();
      cy.defaultIntercepts();
      cy.visit('/fyllut/datafetchertest/arbeidsrettetaktivitet?sub=paper');
      cy.defaultWaits();
    });

    it('should hide component and not fetch data', () => {
      cy.get('.navds-alert--warning').contains('Ingen aktiviteter ble hentet');
      cy.findByRole('group', { name: LABEL_AKTIVITETSVELGER }).should('not.exist');
      cy.findByRole('group', { name: LABEL_AKTIVITETSVELGER }).should('not.exist');
      cy.get('@registerData.all').should('have.length', 0);
    });

    it('should not validate component', () => {
      cy.clickNextStep();
      cy.get('[data-cy=error-summary]').should('not.exist');
      cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
    });

    it('should show component which is conditionally shown when fetch is disabled', () => {
      cy.clickNextStep();
      cy.get('[data-cy=error-summary]').should('not.exist');

      cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
      cy.findByLabelText('Faktura fra SFO')
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: TEXTS.statiske.attachment.leggerVedNaa }).should('exist').check();
        });
      cy.findByLabelText('Annen dokumentasjon')
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: TEXTS.statiske.attachment.nei }).should('exist').check();
        });

      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
    });
  });

  describe('Summary page', () => {
    describe('When API returns list containing data', () => {
      beforeEach(() => {
        cy.mocksUseRouteVariant('get-register-data-activities:success');
        cy.visit('/fyllut/datafetchercontainer/aktivitetsoversikt?sub=digital');
        cy.findByRole('group', { name: LABEL_AKTIVITETSVELGER })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox', { name: 'Aktivitet 1' }).should('exist').check();
          });
        cy.clickSaveAndContinue();
        cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      });

      it('shows selected activity label', () => {
        cy.findByRole('heading', { name: 'Velg aktivitet' })
          .should('exist')
          .parent()
          .parent()
          .within(() => {
            cy.findAllByRole('listitem').should('have.length', 1).first().should('contain.text', 'Aktivitet 1');
          });
      });

      it('allows user to edit selected activities', () => {
        cy.clickEditAnswer('Velg aktivitet');
        cy.findByRole('group', { name: LABEL_AKTIVITETSVELGER })
          .should('exist')
          .within(() => {
            cy.findByRole('checkbox', { name: 'Aktivitet 1' }).should('be.checked');
            cy.findByRole('checkbox', { name: 'Aktivitet 2' }).should('not.be.checked');
            cy.findByRole('checkbox', { name: 'Aktivitet 3' }).should('not.be.checked').check();
          });
        cy.clickSaveAndContinue();
        cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');

        cy.findByRole('heading', { name: 'Velg aktivitet' })
          .should('exist')
          .parent()
          .parent()
          .within(() => {
            cy.findAllByRole('listitem')
              .should('have.length', 2)
              .each((item, index) => {
                expect(item.text()).to.equal(index === 0 ? 'Aktivitet 1' : 'Aktivitet 3');
              });
          });
      });
    });
  });

  describe('Attachments with conditional using dataFetcher util', () => {
    it('should be included', () => {
      cy.mocksUseRouteVariant('get-register-data-activities:success-two-activities');

      cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad', (req) => {
        const { submission, attachments } = req.body;
        expect(submission.data.hvorMangeAktiviteterErAktuelle).to.eq(2);
        expect(attachments).to.have.length(1);
        expect(attachments[0].vedleggsnr).to.eq('U1');
      }).as('submitMellomlagring');

      cy.visit('/fyllut/checkcondition?sub=digital');
      cy.clickStart();

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Diverse data' }).should('exist').click();
      cy.findByRole('textbox', { name: 'Startdato (dd.mm.åååå)' }).type('31.12.2000');
      cy.findByRole('group', { name: /Aktivitetsvelger.*/ })
        .should('exist')
        .within(() => {
          cy.findAllByRole('checkbox').should('have.length', 2);
          cy.findByRole('checkbox', { name: /Helse.*/ })
            .should('exist')
            .check();
        });
      cy.clickSaveAndContinue();

      cy.findByRole('textbox', { name: 'Hvor mange aktiviteter er aktuelle?' }).should('exist').type('2');
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.clickSaveAndContinue();
      cy.wait('@submitMellomlagring');
    });

    it('should not be included', () => {
      cy.mocksUseRouteVariant('get-register-data-activities:success-two-activities');

      cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad', (req) => {
        const { submission, attachments } = req.body;
        expect(submission.data.hvorMangeAktiviteterErAktuelle).to.eq(2);
        expect(attachments).to.have.length(0);
      }).as('submitMellomlagring');

      cy.visit('/fyllut/checkcondition?sub=digital');
      cy.clickStart();

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Diverse data' }).should('exist').click();
      cy.findByRole('textbox', { name: 'Startdato (dd.mm.åååå)' }).type('31.12.2000');
      cy.findByRole('group', { name: /Aktivitetsvelger.*/ })
        .should('exist')
        .within(() => {
          cy.findAllByRole('checkbox').should('have.length', 2);
          cy.findByRole('checkbox', { name: /Utdanning.*/ })
            .should('exist')
            .check();
        });
      cy.clickSaveAndContinue();

      cy.findByRole('textbox', { name: 'Hvor mange aktiviteter er aktuelle?' }).should('exist').type('2');
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.clickSaveAndContinue();
      cy.wait('@submitMellomlagring');
    });
  });
});
