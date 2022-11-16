import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";

describe("When form has panels that are hidden unless a condition is true", () => {
  beforeEach(() => {
    cy.intercept("GET", "/fyllut/api/config", { fixture: "config.json" }).as("getConfig");
    cy.intercept("GET", "/fyllut/api/forms/conditionalxmas", {
      fixture: "conditionalxmas.json",
    }).as("getForm");
    cy.visit("/fyllut/conditionalxmas");
    cy.wait("@getForm");
    cy.clickStart(); // <-- navigate from information page to the form
  });

  it("Renders the first panel of the form", () => {
    cy.findByRole("heading", { name: TEXTS.statiske.introPage.title }).should("not.exist");
    cy.findByRole("heading", { name: "Julemeny" }).should("exist");
  });

  describe("Filling out the form", () => {
    it("adds the panel 'Pinnekjøtt' when radio option pinnekjøtt is selected", () => {
      cy.findByRole("button", { name: "2 Pinnekjøtt" }).should("not.exist");
      cy.findByRole("group", { name: "Julemiddag" }).within(() => {
        cy.findByText("Pinnekjøtt").click();
      });
      cy.findByRole("button", { name: "2 Pinnekjøtt" }).should("exist");
      cy.findByRole("button", { name: "2 Lutefisk" }).should("not.exist");
    });

    it("adds the panel 'Lutefisk' when radio option lutefisk is selected", () => {
      cy.findByRole("button", { name: "2 Lutefisk" }).should("not.exist");
      cy.findByRole("group", { name: "Julemiddag" }).within(() => {
        cy.findByText("Lutefisk").click();
      });
      cy.findByRole("button", { name: "2 Lutefisk" }).should("exist");
      cy.findByRole("button", { name: "2 Pinnekjøtt" }).should("not.exist");
    });
  });

  describe("Summary page", () => {
    beforeEach(() => {
      cy.findByRole("group", { name: "Julemiddag" }).within(() => {
        cy.findByText("Pinnekjøtt").click();
      });
      cy.clickNextStep();
      cy.findByRole("checkbox", { name: "Rotmos (valgfritt)" }).click({ force: true });
      cy.clickNextStep();
      cy.findByRole("checkbox", { name: "Sjokoladetrekk (valgfritt)" }).click({ force: true });
      cy.clickNextStep();
    });

    it("lists the submission for the added panel", () => {
      cy.findByRole("heading", { name: "Oppsummering" }).should("exist");
      cy.findByRole("heading", { name: "Pinnekjøtt", level: 3 }).should("exist");
      cy.findByText("Rotmos").should("exist");
    });

    it("navigates back to the added panel when 'rediger' link is clicked", () => {
      cy.findByRole("link", { name: "Rediger pinnekjøtt" }).click();
      cy.findByRole("checkbox", { name: "Rotmos (valgfritt)" }).should("exist");
      cy.findByRole("checkbox", { name: "Rotmos (valgfritt)" }).should("be.checked");
    });

    it("displays the submission for a different added panel when form is edited", () => {
      cy.findByRole("link", { name: "Rediger julemeny" }).click();
      cy.findByRole("group", { name: "Julemiddag" }).within(() => {
        cy.findByText("Lutefisk").click();
      });
      cy.clickNextStep();
      cy.findByRole("checkbox", { name: "Erterstuing (valgfritt)" }).click({ force: true });
      cy.clickNextStep();
      cy.clickNextStep();
      cy.findByRole("heading", { name: "Oppsummering" }).should("exist");
      cy.findByRole("heading", { name: "Lutefisk", level: 3 }).should("exist");
      cy.findByText("Erterstuing").should("exist");
    });
  });
});
