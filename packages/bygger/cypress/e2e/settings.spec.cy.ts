const _submitData = {
  title: "Cypress test for settings page",
  skjemanummer: "cypress-innstillinger",
  tema: "BIL",
  downloadPdfButtonText: "DownloadPDFBtnTest",
  innsending: "PAPIR_OG_DIGITAL",
  ettersending: "PAPIR_OG_DIGITAL",
  descriptionOfSignatures: "Test Instructions",
  signatureLabel: "Test account",
  signatureDescription: "Instruction from test...",
};

describe("FormSettingsPage", () => {
  beforeEach(() => {
    cy.intercept("GET", "/api/config", { fixture: "config.json" }).as("getConfig");
    cy.intercept("GET", "/form?*", {
      fixture: "getForm.json",
    }).as("getForm");
    cy.intercept("GET", "/mottaksadresse/submission", { fixture: "mottakadresse.json" }).as("getMottakAdresse");
    cy.intercept("GET", "/api/temakoder", { fixture: "temakoder.json" }).as("getTemaKoder");
    cy.intercept("GET", "/countries?*", { fixture: "getCountriesLangNb.json" }).as("getCountriesLangNb");
    cy.visit("forms/cypressinnstillinger/settings");
  });

  it("Fills all elements in settings page", () => {
    cy.intercept("PUT", "form/*", (req) => {
      expect(req.body.properties.tema).to.include(_submitData.tema);
      expect(req.body.title).to.include(_submitData.title);
      expect(req.body.properties.skjemanummer).to.include(_submitData.skjemanummer);
      expect(req.body.properties.descriptionOfSignatures).to.include(_submitData.descriptionOfSignatures);
      expect(req.body.properties.innsending).to.include(_submitData.innsending);
      expect(req.body.properties.signatures[0].label).to.include(_submitData.signatureLabel);
      expect(req.body.properties.signatures[0].description).to.include(_submitData.signatureDescription);
      req.reply(req.body);
    }).as("compareRequestData");

    cy.findByRole("textbox", { name: "Tittel" }).focus().clear().type(_submitData.title);
    cy.findByRole("combobox", { name: "Tema" }).select(_submitData.tema);
    cy.findByRole("textbox", { name: "Tekst på knapp for nedlasting av pdf" })
      .focus()
      .clear()
      .type(_submitData.downloadPdfButtonText);
    cy.findByRole("combobox", { name: "Innsending" }).select(_submitData.innsending);
    cy.findByRole("combobox", { name: "Ettersending" }).select(_submitData.ettersending);
    cy.findByRole("textbox", { name: "Generelle instruksjoner (valgfritt)" })
      .focus()
      .clear()
      .type(_submitData.descriptionOfSignatures);
    cy.findByRole("textbox", { name: "Hvem skal signere?" }).focus().clear().type(_submitData.signatureLabel);
    cy.findByRole("textbox", { name: "Instruksjoner til den som signerer" })
      .focus()
      .clear()
      .type(_submitData.signatureDescription);

    cy.contains("Lagre").click();
    cy.get('[aria-live="polite"]').should("contain.text", `Lagret skjema ${_submitData.title}`);
  });
});
