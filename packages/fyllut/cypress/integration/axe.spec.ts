describe("Axe: Accessibility testing", () => {
  describe("Simple test for all tabs in one run", () => {
    before(() => {
      cy.intercept("GET", "/fyllut/api/config", { fixture: "config.json" }).as("getConfig");
      cy.intercept("GET", "/fyllut/api/forms/cypressaxe", { fixture: "cypressaxe.json" }).as("getCypressAxe");
      cy.visit("/fyllut/cypressaxe");
      cy.wait("@getCypressAxe");
      cy.injectAxe();
    });

    it("Start page", () => {
      // Sometimes checkA11y fails if you do it to early, so this is instead of doing cy.wait(1000) or similar.
      cy.findByRole("main").should("exist");
      cy.checkA11y();
    });

    it("Person", () => {
      cy.clickStart();
      cy.checkA11y(
        {
          exclude: [".formio-select-autocomplete-input"],
        },
        {
          includedImpacts: ["minor"],
        }
      );
    });

    it("Penger og konto", () => {
      cy.findByRole("button", { name: "2 Penger og konto" }).click();
      cy.checkA11y();
    });

    it("Bedrift / organisasjon", () => {
      cy.findByRole("button", { name: "3 Bedrift / organisasjon" }).click();
      cy.checkA11y();
    });

    it("Dato og tid", () => {
      cy.findByRole("button", { name: "4 Dato og tid" }).click();
      cy.checkA11y({
        exclude: [".formio-select-autocomplete-input"],
      });
    });

    it("Standard felter", () => {
      cy.findByRole("button", { name: "5 Standard felter" }).click();
      cy.checkA11y({
        exclude: [".formio-select-autocomplete-input"],
      });
    });

    it("Layout", () => {
      cy.findByRole("button", { name: "6 Layout" }).click();
      cy.checkA11y({
        exclude: [".alertstripe"],
      });
    });

    it("Data", () => {
      cy.findByRole("button", { name: "7 Data" }).click();
      cy.checkA11y();
    });
  });
});
