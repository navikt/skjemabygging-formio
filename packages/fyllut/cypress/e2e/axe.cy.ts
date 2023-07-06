describe("Axe: Accessibility testing", () => {
  describe("Simple test for all tabs in one run", () => {
    before(() => {
      cy.intercept("GET", "/fyllut/api/config", { fixture: "config.json" }).as("getConfig");
      cy.intercept("GET", "/fyllut/api/forms/cypressaxe", { fixture: "cypressaxe.json" }).as("getCypressAxe");
      cy.intercept("GET", "/fyllut/api/translations/cypressaxe", { body: {} }).as("getTranslation");
      cy.intercept("POST", "/collect-auto", { body: "success" }).as("amplitudeLogging");
      cy.visit("/fyllut/cypressaxe");
      cy.wait("@getConfig");
      cy.wait("@getCypressAxe");
      cy.wait("@getTranslation");
      cy.injectAxe();
    });

    it("Start page", () => {
      // Sometimes checkA11y fails if you do it to early, so this is instead of doing cy.wait(1000) or similar.
      cy.findByRole("main").should("exist");
      cy.checkA11y();
    });

    it("Person", () => {
      cy.contains("Start").click();
      cy.checkA11y();
    });

    it("Penger og konto", () => {
      cy.contains("Penger og konto").click();
      cy.checkA11y();
    });

    it("Bedrift / organisasjon", () => {
      cy.contains("Bedrift / organisasjon").click();
      cy.checkA11y();
    });

    it.skip("Dato og tid", () => {
      cy.contains("Dato og tid").click();
      cy.checkA11y();
    });

    it("Standard felter", () => {
      cy.contains("Standard felter").click();
      cy.checkA11y();
    });

    it("Layout", () => {
      cy.contains("Layout").click();
      cy.checkA11y({
        exclude: [".alertstripe"],
      });
    });

    it("Data", () => {
      cy.contains("Data").click();
      cy.checkA11y();
    });
  });
});
