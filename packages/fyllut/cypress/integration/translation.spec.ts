describe("Translations", () => {
  beforeEach(() => {
    cy.intercept("GET", "/fyllut/api/config", { fixture: "config.json" }).as("getConfig");
    cy.intercept("GET", "/fyllut/api/forms/cypress101", { fixture: "cypress101.json" }).as("getForm");
    cy.intercept("GET", "/fyllut/translations/cypress101", { fixture: "cypress101-translation.json" }).as(
      "getTranslation"
    );
    cy.intercept("GET", "/fyllut/global-translations/en", { fixture: "global-translation.json" }).as(
      "getGlobalTranslation"
    );
    cy.intercept("POST", "https://amplitude.nav.no/collect-auto", {}).as("amplitude");
  });

  describe("Change translations based on url params", () => {
    it("get default bokmål", () => {
      cy.visit("/fyllut/cypress101/skjema");
      cy.findByRole("button", { name: "Norsk bokmål" }).should("exist");
    });

    it("get bokmål with lang param", () => {
      cy.visit("/fyllut/cypress101/skjema?lang=nb-NO");
      cy.findByRole("button", { name: "Norsk bokmål" }).should("exist");
    });

    it("get nynorsk with lang param", () => {
      cy.visit("/fyllut/cypress101/skjema?lang=nn-NO");
      cy.findByRole("button", { name: "Norsk nynorsk" }).should("exist");
    });

    it("get english with lang param", () => {
      cy.visit("/fyllut/cypress101/skjema?lang=en");
      cy.findByRole("button", { name: "English" }).should("exist");
    });
  });

  describe("Change translation language", () => {
    beforeEach(() => {
      cy.visit("/fyllut/cypress101/skjema");
    });

    it("change to english and back to norwegian", () => {
      cy.findByRole("heading", { name: "Veiledning" }).should("exist");
      cy.findByRole("button", { name: "Norsk bokmål" }).click();
      cy.findByRole("link", { name: "English" }).click();
      cy.findByRole("heading", { name: "Guidance" }).should("exist");
      cy.findByRole("button", { name: "English" }).click();
      cy.findByRole("link", { name: "Norsk bokmål" }).click();
      cy.findByRole("heading", { name: "Veiledning" }).should("exist");
    });
  });
});
