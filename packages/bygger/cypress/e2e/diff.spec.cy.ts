describe("Diff", () => {
  beforeEach(() => {
    cy.intercept("GET", "/api/config", { fixture: "config.json" }).as("getConfig");
    cy.intercept("GET", "/form?*", { fixture: "form123456.json" }).as("getForm");
    cy.intercept("GET", "/api/published-forms/dif123456", { fixture: "form123456-published.json" }).as(
      "getPublishedForm"
    );
    cy.intercept("GET", "/mottaksadresse/submission", { fixture: "mottakadresse.json" }).as("getMottakAdresse");
    cy.intercept("GET", "/api/temakoder", { fixture: "temakoder.json" }).as("getTemaKoder");
    cy.intercept("GET", "/countries?*", { fixture: "getCountriesLangNb.json" }).as("getCountriesLangNb");
  });

  describe("Settings page", () => {
    beforeEach(() => {
      cy.visit("forms/dif123456/settings");
      cy.wait("@getForm");
      cy.wait("@getPublishedForm");
      cy.wait("@getTemaKoder");
      cy.wait("@getMottakAdresse");
    });

    it("Renders settings page without any diffs", () => {
      cy.findByRole("heading", { name: "Skjema for testing av diff" });
      cy.findAllByText("Endring").should("have.length", 0);
    });

    it("Renders tags when data is changed", () => {
      cy.findByRole("textbox", { name: "Tittel" }).should("exist").type(" og sånt");
      cy.findByRole("group", { name: "Signatur 1" })
        .should("exist")
        .within(() => {
          cy.findByRole("textbox", { name: "Hvem skal signere?" }).should("exist").type("{selectall}Doktor");
        });
      cy.findByRole("button", { name: "Legg til signatur" }).should("exist").click();
      cy.findByRole("group", { name: "Signatur 2 Ny" })
        .should("exist")
        .within(() => {
          cy.findByRole("textbox", { name: "Hvem skal signere?" }).should("exist").type("Advokat");
        });

      cy.findAllByText("Endring").should("have.length", 2);
      cy.findAllByText("Ny").should("have.length", 1);
    });
  });
});
