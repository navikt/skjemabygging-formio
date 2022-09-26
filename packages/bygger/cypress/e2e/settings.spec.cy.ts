import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";

describe("FormSettingsPage", () => {
  beforeEach(() => {
    cy.intercept("GET", "/api/config", { fixture: "config.json" }).as("getConfig");

    cy.intercept("GET", "/form?*", {
      fixture: "getForm.json",
    }).as("getForm");
    cy.intercept("GET", "/mottaksadresse/submission", { fixture: "mottakadresse.json" }).as("getMottakAdresse");
    cy.visit("forms/cypressinnstillinger/settings");
  });

  it("Fills all elements in settings page", () => {
    cy.fixture("submitData.json").as("submitData");

    cy.get("@submitData").then((mockSubmitData: any) => {
      cy.intercept("PUT", "form/*", (req, res) => {
        const submitData = mockSubmitData as NavFormType;
        expect(req.body.properties.tema).to.include(submitData.properties.tema);
        expect(req.body.title).to.include(submitData.title);
        expect(req.body.properties.skjemanummer).to.include(submitData.properties.skjemanummer);
        expect(req.body.properties.descriptionOfSignatures).to.include(submitData.properties.descriptionOfSignatures);
        expect(req.body.properties.signatures[0].label).to.include(submitData.properties.signatures[0].label);
        expect(req.body.properties.signatures[0].description).to.include(
          submitData.properties.signatures[0].description
        );
        req.reply(submitData);
      }).as("compareSubmitData");
    });

    //cy.get('a').contains("TEST-CYPRESS").click()
    //cy.get('a').contains("Innstillinger").click()
    cy.get('[id="title"]').focus().clear().type("Cypress test for settings page");
    cy.get('[id="tema"]').focus().clear().type("CYPRESSTEST");
    cy.get('[id="downloadPdfButtonText"]').focus().clear().type("Test");
    cy.get('[id="form-innsending"]').select("Papir og digital");
    cy.get('[id="form-mottaksadresse"]').select("Standard");
    cy.get('[id="form-generalinstructions"]').focus().clear().type("Test Instructions");
    cy.get('[name="signature1"]').focus().clear().type("Lege");
    cy.get('[name="signatureInstruction0"]').focus().clear().type("Instruksjoner fra lege...");
    cy.contains("Lagre").click();
    cy.get('[aria-live="polite"]').should("contain.text", "Lagret skjema Cypress test for settings page");
  });
});
