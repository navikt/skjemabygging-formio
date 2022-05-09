const INFORMATION_PAGE_HEADER = "Vær oppmerksom på dette før du begynner å fylle ut søknaden";
const BACK_BUTTON_CONFIRMATION_TEXT =
  "Hvis du går vekk fra denne siden kan du miste dataene du har fylt ut. Er du sikker på at du vil gå tilbake?";

describe("Form navigation", () => {
  beforeEach(() => {
    cy.intercept("GET", "/fyllut/api/forms/cypress101", { fixture: "cypress101.json" }).as("getCypress101");
    cy.visit("/fyllut/cypress101");
    cy.wait("@getCypress101");
  });

  it("Renders the information page", () => {
    cy.findByRole("heading", { name: INFORMATION_PAGE_HEADER }).should("exist");
  });

  describe("Navigation away from the form to the information page", () => {
    beforeEach(() => {
      cy.clickStart(); // <-- navigate from information page to the form
      cy.findByRole("heading", { name: INFORMATION_PAGE_HEADER }).should("not.exist");
    });

    describe("Click on browser back button", () => {
      it("Navigates back to information page when user confirms", { defaultCommandTimeout: 10000 }, () => {
        cy.go("back");
        cy.on("window:confirm", (text) => {
          expect(text).to.contains(BACK_BUTTON_CONFIRMATION_TEXT);
          return true; // <-- confirms
        });
        cy.findByRole("heading", { name: INFORMATION_PAGE_HEADER }).should("exist");
        cy.findByRole("heading", { level: 2, name: "Veiledning" }).should("not.exist");
      });

      it("Does not navigate back to information page when user declines", { defaultCommandTimeout: 10000 }, () => {
        cy.go("back");
        cy.on("window:confirm", (text) => {
          expect(text).to.contains(BACK_BUTTON_CONFIRMATION_TEXT);
          return false; // <-- declines
        });
        cy.findByRole("heading", { name: INFORMATION_PAGE_HEADER }).should("not.exist");
        cy.findByRole("heading", { level: 2, name: "Veiledning" }).should("exist");
      });
    });
  });
});
