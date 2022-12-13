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
      cy.checkA11y();
    });

    it("Penger og konto", () => {
      cy.findByRole("link", { name: "Penger og konto" }).click();
      cy.checkA11y();
    });

    it("Bedrift / organisasjon", () => {
      cy.findByRole("link", { name: "Bedrift / organisasjon" }).click();
      cy.checkA11y();
    });

    it("Dato og tid", () => {
      cy.findByRole("link", { name: "Dato og tid" }).click();
      cy.checkA11y();
    });

    it("Standard felter", () => {
      cy.findByRole("link", { name: "Standard felter" }).click();
      cy.checkA11y();
    });

    it("Layout", () => {
      cy.findByRole("link", { name: "Layout" }).click();
      cy.checkA11y({
        exclude: [".alertstripe"],
      });
    });

    it("Data", () => {
      cy.findByRole("link", { name: "Data" }).click();
      cy.checkA11y();
    });
  });
});
