import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('Focus handling', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Set focus on heading', () => {
    beforeEach(() => {
      cy.visit('/fyllut/datagridconditional/barnSomSoknadenGjelderFor?sub=paper');
      cy.defaultWaits();
    });

    it('has focus after navigating to next panel', () => {
      cy.findByLabelText('Fornavn').should('exist').type('Gaute');
      cy.findByRole('group', { name: 'Trenger barnet briller?' })
        .should('exist')
        .within(() => {
          cy.findByLabelText('Ja').click();
        });
      cy.clickNextStep();
      cy.focused().should('match', 'h2');
    });

    it('has focus after navigating to previous panel', () => {
      cy.clickPreviousStep();
      cy.focused().should('match', 'h2');
    });

    it('has focus on intro and summary page', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Introduksjon' }).click();
      cy.focused().should('match', 'h2');
      cy.findByRole('link', { name: 'Oppsummering' }).click();
      cy.focused().should('match', 'h2');
    });
  });

  describe('Datagrid', () => {
    it('restores radiopanel focus after rerender due to conditional', () => {
      cy.visit('/fyllut/datagridconditional/barnSomSoknadenGjelderFor?sub=paper');
      cy.defaultWaits();
      cy.findByLabelText('Fornavn').should('exist').type('Gaute');
      cy.findByRole('group', { name: 'Trenger barnet briller?' })
        .should('exist')
        .within(() => {
          cy.findByLabelText('Ja').click();
        });
      cy.findByText('Her vises en informasjonstekst.').should('exist').shouldBeVisible();
      cy.findByRole('group', { name: 'Trenger barnet briller?' })
        .should('exist')
        .within(() => {
          cy.findByLabelText('Ja').should('have.focus');
        });
    });

    it('sets focus to correct radio input when value is toggled back and forth', () => {
      cy.visit('/fyllut/datagridconditional/barnSomSoknadenGjelderFor?sub=paper');
      cy.defaultWaits();
      cy.findByLabelText('Fornavn').should('exist').type('Klara');
      cy.findByRole('group', { name: 'Trenger barnet briller?' })
        .should('exist')
        .within(() => {
          cy.findByLabelText('Ja').click();
        });
      cy.findByText('Her vises en informasjonstekst.').should('exist').shouldBeVisible();
      cy.findByRole('group', { name: 'Trenger barnet briller?' })
        .should('exist')
        .within(() => {
          cy.findByLabelText('Ja').should('have.focus');
          cy.findByLabelText('Nei').click();
        });
      cy.findByText('Her vises en informasjonstekst.').should('not.exist');
      cy.findByRole('group', { name: 'Trenger barnet briller?' })
        .should('exist')
        .within(() => {
          cy.findByLabelText('Nei').should('have.focus');
          cy.findByLabelText('Ja').click();
        });
      cy.findByText('Her vises en informasjonstekst.').should('exist').shouldBeVisible();
      cy.findByRole('group', { name: 'Trenger barnet briller?' })
        .should('exist')
        .within(() => {
          cy.findByLabelText('Ja').should('have.focus');
          cy.findByLabelText('Nei').click();
        });
      cy.findByText('Her vises en informasjonstekst.').should('not.exist');
      cy.findByRole('group', { name: 'Trenger barnet briller?' })
        .should('exist')
        .within(() => {
          cy.findByLabelText('Nei').should('have.focus');
        });
    });

    it('restores textfield focus after rerender due to conditional', () => {
      cy.visit('/fyllut/datagridconditional/levering?sub=paper');
      cy.defaultWaits();
      cy.findByRole('textbox', { name: 'Mottakers fornavn' }).should('exist').type('Maximillian');
      cy.findByText('Fornavn er for langt og vil ikke vises i sin helhet.').should('exist').shouldBeVisible();
      cy.findByRole('textbox', { name: 'Mottakers fornavn' }).should('have.focus');
    });
  });

  describe('Error summary', () => {
    it('gets focus when clicking next page and errors exists on page', () => {
      cy.visit('/fyllut/datagridconditional/levering?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
      cy.get('[data-cy=error-summary]').should('exist');
      cy.get('[data-cy=error-summary]').should('not.have.attr', 'aria-live');
      cy.get('[data-cy=error-summary]').within(() => {
        cy.findByRole('heading', { name: TEXTS.validering.error }).should('have.focus');
      });

      cy.findByRole('button', { name: 'Neste steg' }).focus();
      cy.findByRole('button', { name: 'Neste steg' }).click();
      cy.get('[data-cy=error-summary]').within(() => {
        cy.findByRole('heading', { name: TEXTS.validering.error }).should('have.focus');
      });
    });

    it('puts focus on correct component when clicking in error summary', () => {
      cy.visit('/fyllut/datagridconditional/levering?sub=paper');
      cy.defaultWaits();
      cy.findByRole('group', { name: 'Hvordan vil du ha pakken levert?' })
        .should('exist')
        .shouldBeVisible()
        .within(() => {
          cy.findByLabelText('På døra').click();
        });
      cy.findByRole('group', { name: 'Hvilken type bolig bor du i?' }).should('exist').shouldBeVisible();
      cy.findByRole('group', { name: 'Hvordan vil du ha pakken levert?' })
        .should('exist')
        .within(() => {
          cy.findByLabelText('På døra').should('have.focus');
        });
      cy.clickNextStep();

      cy.findByRole('heading', { name: TEXTS.validering.error })
        .should('exist')
        .parent()
        .within(() => {
          cy.get('li').should('have.length', 2);
        });

      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Du må fylle ut: Hvilken type bolig bor du i?' }).should('exist');
          cy.findByRole('link', { name: 'Du må fylle ut: Hvilken type bolig bor du i?' }).click({ force: true });
        });

      cy.findByRole('group', { name: 'Hvilken type bolig bor du i?' })
        .should('exist')
        .should('have.focus')
        .shouldBeVisible()
        .within(() => {
          cy.findByLabelText('Rekkehus').click();
        });

      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Du må fylle ut: Mottakers fornavn' }).should('exist');
          cy.findByRole('link', { name: 'Du må fylle ut: Mottakers fornavn' }).click({ force: true });
        });
      cy.findByRole('textbox', { name: 'Mottakers fornavn' }).should('have.focus').type('Max');

      cy.get('[data-cy=error-summary]').should('not.exist');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
    });
  });

  describe('One-time field focus', () => {
    const openSummaryErrors = () => {
      cy.visit('/fyllut/errorfocus/oppsummering?sub=paper');
      cy.defaultWaits();
      cy.clickDownloadInstructions();
    };

    it('preserves focus during conditional changes and restores heading focus for next, back and stepper navigation', () => {
      openSummaryErrors();
      cy.findByRole('link', { name: 'Du må fylle ut: Answer' }).click();
      cy.findByRole('textbox', { name: 'Answer' }).should('have.focus');
      cy.location('hash').should('equal', '');
      cy.window().its('history.state.usr').should('not.have.property', 'focusId');
      cy.findByRole('textbox', { name: 'Answer' }).type('My answer');

      cy.findByRole('checkbox', { name: /^Show details/ }).click();
      cy.findByRole('textbox', { name: /^Details/ }).should('be.visible');
      cy.findByRole('checkbox', { name: /^Show details/ }).should('have.focus');
      cy.findByRole('radio', { name: 'First choice' }).check();

      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Follow-up', level: 2 }).should('have.focus');
      cy.clickPreviousStep();
      cy.findByRole('heading', { name: 'Answers', level: 2 }).should('have.focus');
      cy.findByRole('textbox', { name: 'Answer' }).should('have.value', 'My answer');

      cy.findByRole('textbox', { name: 'Answer' }).clear();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Oppsummering' }).click();
      cy.clickDownloadInstructions();
      cy.findByRole('link', { name: 'Du må fylle ut: Answer' }).click();
      cy.findByRole('textbox', { name: 'Answer' }).should('have.focus');
      cy.findByRole('link', { name: 'Follow-up' }).click();
      cy.findByRole('heading', { name: 'Follow-up', level: 2 }).should('have.focus');
      cy.go('back');
      cy.findByRole('heading', { name: 'Answers', level: 2 }).should('have.focus');
    });

    it('allows fresh group-focus requests and still focuses same-page errors', () => {
      openSummaryErrors();
      cy.findByRole('link', { name: 'Du må fylle ut: Choice' }).click();
      cy.findByRole('group', { name: 'Choice' }).should('have.focus');
      cy.findByRole('radio', { name: 'First choice' }).should('not.be.checked');
      cy.findByRole('radio', { name: 'Second choice' }).should('not.be.checked');
      cy.location('hash').should('equal', '');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Oppsummering' }).click();
      cy.clickDownloadInstructions();
      cy.findByRole('link', { name: 'Du må fylle ut: Choice' }).click();
      cy.findByRole('group', { name: 'Choice' }).should('have.focus');

      cy.clickNextStep();
      cy.get('[data-cy=error-summary]').within(() => {
        cy.findByRole('heading', { name: TEXTS.validering.error }).should('have.focus');
        cy.findByRole('link', { name: 'Du må fylle ut: Answer' }).click();
      });
      cy.findByRole('textbox', { name: 'Answer' }).should('have.focus');
    });

    it('consumes a direct field hash without replaying it after a conditional update', () => {
      cy.visit('/fyllut/errorfocus/answers?sub=paper#input-answer');
      cy.defaultWaits();
      cy.findByRole('textbox', { name: 'Answer' }).should('have.focus');
      cy.location('hash').should('equal', '');
      cy.findByRole('checkbox', { name: /^Show details/ }).click();
      cy.findByRole('textbox', { name: /^Details/ }).should('be.visible');
      cy.findByRole('checkbox', { name: /^Show details/ }).should('have.focus');
    });

    it('does not revive an expired field request when a missing target later becomes visible', () => {
      cy.visit('/fyllut/errorfocus/answers?sub=paper#input-details');
      cy.defaultWaits();
      cy.findByRole('textbox', { name: /^Details/ }).should('not.exist');
      cy.location('hash').should('equal', '');
      cy.findByRole('checkbox', { name: /^Show details/ }).click();
      cy.findByRole('textbox', { name: /^Details/ }).should('be.visible');
      cy.findByRole('checkbox', { name: /^Show details/ }).should('have.focus');
    });
  });
});
