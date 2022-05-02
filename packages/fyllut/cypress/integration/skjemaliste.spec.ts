describe("Skjemaliste", () => {
  beforeEach(() => {
    cy.visit("/fyllut");
  });

  it("displays list header", () => {
    cy.findByRole("heading", { name: "Velg et skjema" }).should("exist");
  });
});
