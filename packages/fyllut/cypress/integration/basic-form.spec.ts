describe("Basic form", () => {
  beforeEach(() => {
    cy.visit("/fyllut/cypress101");
  });

  it("visits the correct form", () => {
    cy.findByRole("heading", { name: "Skjema for Cucumber-testing" }).should("not.exist");
    cy.findByRole("heading", { name: "Skjema for Cypress-testing" }).should("exist");
  });

  describe.only("Step navigation", () => {
    it("navigates to step 2 when 'neste' is clicked", { defaultCommandTimeout: 10000 }, () => {
      cy.findByRole("heading", { level: 2, name: "Veiledning" }).should("exist");

      cy.findByRoleWhenAttached("button", { name: "Neste" }).click();
      cy.findByRole("heading", { level: 2, name: "Dine opplysninger" }).should("exist");
    });
  });
});
