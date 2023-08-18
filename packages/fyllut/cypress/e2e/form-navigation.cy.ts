import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";

const BACK_BUTTON_CONFIRMATION_TEXT =
  "Hvis du går vekk fra denne siden kan du miste dataene du har fylt ut. Er du sikker på at du vil gå tilbake?";

describe("Form navigation", () => {
  beforeEach(() => {
    cy.intercept("GET", "/fyllut/api/config", { fixture: "config.json" }).as("getConfig");
    cy.intercept("GET", "/fyllut/api/forms/cypress101", { fixture: "cypress101.json" }).as("getCypress101");
    cy.intercept("GET", "/fyllut/api/translations/cypress101", { body: {} }).as("getTranslation");
    cy.intercept("POST", "/collect-auto", { body: "success" }).as("amplitudeLogging");
    cy.visit("/fyllut/cypress101?sub=paper");
    cy.wait("@getCypress101");
  });

  it("Renders the information page", () => {
    cy.findByRole("heading", { name: TEXTS.statiske.introPage.title }).should("exist");
  });

  describe("Navigation away from the form to the information page", () => {
    beforeEach(() => {
      cy.clickStart(); // <-- navigate from information page to the form
      cy.findByRole("heading", { name: TEXTS.statiske.introPage.title }).should("not.exist");
    });

    describe("Click on browser back button", () => {
      it("Navigates back to information page when user confirms", { defaultCommandTimeout: 10000 }, () => {
        cy.go("back");
        cy.on("window:confirm", (text) => {
          expect(text).to.contains(BACK_BUTTON_CONFIRMATION_TEXT);
          return true; // <-- confirms
        });
        cy.findByRole("heading", { name: TEXTS.statiske.introPage.title }).should("exist");
        cy.findByRole("heading", { level: 2, name: "Veiledning" }).should("not.exist");
      });

      it("Does not navigate back to information page when user declines", { defaultCommandTimeout: 10000 }, () => {
        cy.go("back");
        cy.on("window:confirm", (text) => {
          expect(text).to.contains(BACK_BUTTON_CONFIRMATION_TEXT);
          return false; // <-- declines
        });
        cy.findByRole("heading", { name: TEXTS.statiske.introPage.title }).should("not.exist");
        cy.findByRole("heading", { level: 2, name: "Veiledning" }).should("exist");
      });
    });
  });
});
