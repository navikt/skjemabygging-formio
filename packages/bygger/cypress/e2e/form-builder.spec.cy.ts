import { navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';

describe('Form Builder', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
    cy.intercept('GET', '/form?*', { fixture: 'form123456.json' }).as('getForm');
    cy.intercept('GET', '/api/published-forms/dif123456', { statusCode: 404 }).as('getPublishedForm');
    cy.intercept('GET', /language\/submission?.*/, { fixture: 'globalTranslations.json' }).as('getTranslations');
    cy.intercept('GET', '/api/countries*', { fixture: 'getCountriesLangNb.json' }).as('getCountriesLangNb');
  });

  it('Trims properties "vedleggskode" and "vedleggstittel" before save', () => {
    cy.intercept('PUT', '/form/63c7abd51578ad48a6dc00cc', (req) => {
      const vedlegg = navFormUtils
        .flattenComponents(req.body.components)
        .find((comp) => comp.key === 'annenDokumentasjon');
      expect(vedlegg.properties.vedleggskode).to.equal('T2');
      expect(vedlegg.properties.vedleggstittel).to.equal('Last opp annen dokumentasjon');
      req.reply(200, req.body);
    }).as('putForm');

    cy.visit('forms/dif123456');
    cy.wait('@getForm');
    cy.findByRole('link', { name: 'Vedlegg' }).click();
    cy.get('[title="Rediger"]').spread((_editPanelButton, editAnnenDokumentasjonButton) =>
      editAnnenDokumentasjonButton.click({ force: true }),
    );
    cy.findByRole('tab', { name: 'API' }).click();
    cy.findByDisplayValue('N6').type('{selectall} T2   ');
    cy.findByDisplayValue('Annet').type('{selectall}  Last opp annen dokumentasjon  ');
    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('button', { name: 'Lagre' }).click();
    cy.wait('@putForm');
  });
});
