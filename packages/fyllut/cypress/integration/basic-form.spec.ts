describe("Basic form", () => {
  beforeEach(() => {
    cy.intercept("GET", "/fyllut/api/forms/cypress101", { fixture: "cypress101.json" }).as("getCypress101");
    cy.visit("/fyllut/cypress101/skjema");
    cy.wait("@getCypress101");
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

  describe("Fill in form", () => {
    it("fill in - go to summary - edit form - navigate back to summary", () => {
      // Steg 1 -> Steg 2
      cy.clickNext();
      cy.findByRole("textbox", { name: "Fornavn" }).should("exist").type("Kari");
      cy.findByRole("textbox", { name: "Etternavn" }).should("exist").type("Norman");

      // Radio panel is currently not reachable by role. Additionally {force: true} is needed here because
      // the input is overlapping with the label element, which makes cypress assume it's not interactable
      cy.get(".radiogruppe")
        .first()
        .should("exist")
        .within(($radio) => cy.findByLabelText("Nei").should("exist").check({ force: true }));

      cy.findByRole("textbox", { name: "Din fødselsdato (dd.mm.åååå)" }).should("exist").type("10.05.1995");
      cy.findByText("Bor du i Norge?")
        .should("exist")
        .parent()
        .within(($radio) => cy.findByLabelText("Ja").should("exist").check({ force: true }));
      cy.findByText("Er kontaktadressen din en vegadresse eller postboksadresse?")
        .should("exist")
        .parent()
        .within(($radio) => cy.findByLabelText("Vegadresse").should("exist").check({ force: true }));
      cy.findByRole("textbox", { name: "Vegadresse" }).should("exist").type("Kirkegata 1");
      cy.findByRole("textbox", { name: "Postnummer" }).should("exist").type("1234");
      cy.findByRole("textbox", { name: "Poststed" }).should("exist").type("Nesvik");
      cy.findByRole("textbox", { name: "Fra hvilken dato skal denne adressen brukes (dd.mm.åååå)?" })
        .should("exist")
        .type("01.01.2020");

      // Steg 2 -> Steg 3
      cy.clickNext();
      cy.findByRole("heading", { level: 2, name: "Vedlegg" }).should("exist");
      cy.findByLabelText("Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved.")
        .should("exist")
        .check({ force: true });

      // Step 3 -> Oppsummering
      cy.clickNext();
      cy.findByRole("heading", { level: 2, name: "Oppsummering" }).should("exist");

      // Gå tilbake til skjema fra oppsummering, og naviger til oppsummering på nytt
      // for å verifisere at ingen valideringsfeil oppstår grunnet manglende verdier.
      cy.findByRoleWhenAttached("link", { name: "Rediger opplysningene" }).should("exist").click();
      cy.findByRoleWhenAttached("link", { name: "Start" }).should("exist").click();
      cy.clickNext();
      cy.clickNext();
      cy.clickNext();

      // Oppsummering
      cy.findByRole("heading", { level: 2, name: "Oppsummering" }).should("exist");
      cy.get("dl")
        .first()
        .within(() => {
          cy.get("dt").eq(0).should("contain.text", "Fornavn");
          cy.get("dd").eq(0).should("contain.text", "Kari");
          cy.get("dt").eq(1).should("contain.text", "Etternavn");
          cy.get("dd").eq(1).should("contain.text", "Norman");
          cy.get("dt").eq(2).should("contain.text", "Har du norsk fødselsnummer eller D-nummer?");
          cy.get("dd").eq(2).should("contain.text", "Nei");
          cy.get("dt").eq(3).should("contain.text", "Din fødselsdato (dd.mm.åååå)");
          cy.get("dd").eq(3).should("contain.text", "10.5.1995");
        });
    });
  });
});
