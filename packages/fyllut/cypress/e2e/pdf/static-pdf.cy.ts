import { expect } from 'chai';

describe('Static PDF', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.mocksRestoreRouteVariants();
    cy.intercept('GET', '/fyllut/api/forms/pdfstatic/static-pdfs').as('getStaticPdf');
    cy.intercept('POST', '/fyllut/api/forms/pdfstatic/static-pdfs/*').as('download');
    cy.visit('/fyllut/pdfstatic/pdf');
    cy.defaultWaits();
    cy.wait('@getStaticPdf');
  });

  it('should be possible to download pdf with social security number', () => {
    cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).type('22015614475');
    cy.findByRole('checkbox', { name: /Vedlegg 1/ }).click();

    cy.findByRole('link', { name: /Fortsett/ }).click();

    cy.findByRole('button', { name: /Last ned skjema/ }).click();

    cy.wait('@download').then((interception) => {
      expect(interception.request.body?.languageCode).to.eq('nb');
      expect(interception.request.body?.attachments[0]).to.eq('vedlegg1');
      expect(interception.request.body?.user?.nationalIdentityNumber).to.eq('22015614475');

      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body?.pdfBase64, 'PDF base64 exists').to.be.a('string');
    });
  });

  it('should be possible to download pdf with name and address', () => {
    cy.findByRole('radio', { name: /Person som ikke har fødselsnummer eller d-nummer/ }).click();

    cy.findByRole('textbox', { name: /Fornavn/ }).type('Ola');
    cy.findByRole('textbox', { name: /Etternavn/ }).type('Nordmann');
    cy.findByRole('textbox', { name: /Vegadresse/ }).type('Fyrstikkalléen 1');
    cy.findByRole('textbox', { name: /Postnummer/ }).type('0661');
    cy.findByRole('textbox', { name: /Poststed/ }).type('Oslo');

    cy.findByRole('checkbox', { name: /Vedlegg 1/ }).click();
    cy.findByRole('checkbox', { name: /Vedlegg 2/ }).click();

    cy.findByRole('link', { name: /Fortsett/ }).click();

    cy.findByRole('button', { name: /Last ned skjema/ }).click();

    cy.wait('@download').then((interception) => {
      expect(interception.request.body?.languageCode).to.eq('nb');
      expect(interception.request.body?.attachments[0]).to.eq('vedlegg1');
      expect(interception.request.body?.attachments[1]).to.eq('vedlegg2');

      expect(interception.request.body?.user?.firstName).to.eq('Ola');
      expect(interception.request.body?.user?.surname).to.eq('Nordmann');
      expect(interception.request.body?.user?.address?.streetAddress).to.eq('Fyrstikkalléen 1');
      expect(interception.request.body?.user?.address?.postalName).to.eq('Oslo');
      expect(interception.request.body?.user?.address?.postalCode).to.eq('0661');
      expect(interception.request.body?.user?.address?.country?.value).to.eq('NO');

      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body?.pdfBase64, 'PDF base64 exists').to.be.a('string');
    });
  });
});
