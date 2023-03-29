describe("Skjemaliste", () => {
  beforeEach(() => {
    cy.intercept("GET", "/fyllut/api/config", { fixture: "config.json" });
    cy.intercept("GET", "/fyllut/api/forms", { fixture: "all-forms.json" });
    cy.visit("/fyllut");
  });

  it("displays list header", () => {
    cy.findByRole("heading", { name: "Velg et skjema" }).should("exist");
  });
});
