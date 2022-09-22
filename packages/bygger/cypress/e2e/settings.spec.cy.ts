describe("FormSettingsPage", () => {
  beforeEach(() => {
    cy.intercept("GET", "/api/config", { fixture: "config.json" }).as("getConfig");

    cy.intercept("GET", "/form?type=form&tags=nav-skjema&path=cypressinnstillinger&limit=1", {
      fixture: "getForm.json",
    }).as("getForm");
    cy.intercept("GET", "/mottaksadresse/submission", { fixture: "mottakadresse.json" }).as("getMottakAdresse");
    cy.intercept("GET", "/language/submission?data.name__regex=/^global(.cypressinnstillinger)*$/gi&limit=1000", {
      fixture: "globalTranslations.json",
    }).as("getGlobalTranslations");
    cy.visit("forms/cypressinnstillinger/settings");
    cy.wait("@getConfig");
    cy.wait("@getForm");
    cy.wait("@getMottakAdresse");
    cy.wait("@getGlobalTranslations");
    //cy.visit("/forms");
    //https://formio-api.dev.nav.no/jvcemxwcpghcqjn/user/login/submission

    // cy.get('[type="email"]').click().type("test@nav.no");
    // cy.get('[type="password"]').click().type("pass");
    // cy.get("button").eq(0).click();
  });

  it("Fills all elements in settings page", () => {
    // //Check log in prompt

    cy.intercept("PUT", "http://localhost/form/632827b2acab016472eac7bb", (req) => {
      expect(req.body.title).to.include("Cypress test for settings page");
      expect(req.body.properties.skjemanummer).to.include("cypress-innstillinger");
      expect(req.body.properties.tema).to.include("CYPRESSTEST");
      expect(req.body.properties.descriptionOfSignatures).to.include("Test Instructions");
      expect(req.body.properties.signatures[0].label).to.include("Lege");
      expect(req.body.properties.signatures[0].description).to.include("Instruksjoner fra lege...");
    });

    // cy.get('a').contains("TEST-CYPRESS").click()
    // cy.get('a').contains("Innstillinger").click()
    // cy.get('[id="title"]').focus().clear()
    // cy.get('[id="title"]').click().type("Cypress test for settings page");
    // cy.get('[id="tema"]').focus().clear()
    // cy.get('[id="tema"]').click().type("CYPRESSTEST");
    // cy.get('[id="downloadPdfButtonText"]').focus().clear();
    // cy.get('[id="downloadPdfButtonText"]').click().type("Test");
    // cy.get('[id="form-innsending"]').select("Papir og digital");
    // cy.get('[id="form-mottaksadresse"]').select("Standard");
    // cy.get('[id="form-generalinstructions"]').focus().clear();
    // cy.get('[id="form-generalinstructions"]').click().type("Test Instructions");
    // cy.get('[name="signature1"]').focus().clear();
    // cy.get('[name="signature1"]').click().type("Lege");
    // cy.get('[name="signatureInstruction0"]').focus().clear();
    // cy.get('[name="signatureInstruction0"]').click().type("Instruksjoner fra lege...");
    // cy.contains('Lagre').click();
  });
});
