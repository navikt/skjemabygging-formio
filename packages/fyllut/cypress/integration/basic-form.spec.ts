describe("Basic form", () => {
  beforeEach(() => {
    cy.visit("/fyllut/cypress101");
  });

  it("visits the correct form", () => {
    cy.findByRole("heading", { name: "Skjema for Cucumber-testing" }).should("not.exist");
    cy.findByRole("heading", { name: "Skjema for Cypress-testing" }).should("exist");
  });

  describe("Step navigation", () => {
    it("navigates to step 2 when 'neste' is clicked", { defaultCommandTimeout: 10000 }, () => {
      cy.findByRole("heading", { level: 2, name: "Veiledning" }).should("exist");

      cy.clickNext();
      cy.findByRole("heading", { level: 2, name: "Dine opplysninger" }).should("exist");
    });

    it("validation errors stops navigation to step 3", () => {
      cy.clickNext();
      cy.clickNext();
      cy.findByRole("heading", { level: 2, name: "Dine opplysninger" });
      cy.findByText("For å gå videre må du rette opp følgende:").should("exist");

      cy.findAllByRole("link", { name: /^Du må fylle ut:/ }).should("have.length", 3);
      cy.findByRoleWhenAttached("link", { name: "Du må fylle ut: Fornavn" }).click();
      cy.findByRole("textbox", { name: "Fornavn" }).should("have.focus");
    });
  });
});
