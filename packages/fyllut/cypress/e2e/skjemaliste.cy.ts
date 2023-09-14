describe("Skjemaliste", () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.intercept("GET", "/fyllut/api/forms", { fixture: "all-forms.json" });
    cy.visit("/fyllut");
  });

  it("displays list header", () => {
    cy.findByRole("heading", { name: "Velg et skjema" }).should("exist");
  });
});
