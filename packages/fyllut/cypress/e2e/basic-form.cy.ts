describe("Basic form", () => {
  beforeEach(() => {
    cy.intercept("GET", "/fyllut/api/forms/cypress101", { fixture: "cypress101.json" }).as("getCypress101");
    cy.intercept("GET", "/fyllut/translations/cypress101", { body: {} }).as("getTranslation");
  });

  const fillInForm = (expectVedleggspanel: boolean) => {
    // Steg 1 -> Steg 2
    cy.clickNextStep();

    cy.findByRole("combobox", { name: "Tittel" }).should("exist").click();
    cy.findByText("Fru").should("exist").click();
    cy.findByRole("textbox", { name: "Fornavn" }).should("exist").type("Kari");
    cy.findByRole("textbox", { name: "Etternavn" }).should("exist").type("Norman");

    // Radio panel is currently not reachable by role. Additionally {force: true} is needed here because
    // the input is overlapping with the label element, which makes cypress assume it's not interactable
    cy.get(".navds-radio-group")
      .first()
      .should("exist")
      .within(($radio) => cy.findByLabelText("Nei").should("exist").check({ force: true }));

    cy.findByRole("textbox", { name: "Din fødselsdato (dd.mm.åååå)" }).should("exist").type("10.05.1995");
    cy.findByText("Bor du i Norge?")
      .should("exist")
      .closest("fieldset")
      .within(($radio) => cy.findByLabelText("Ja").should("exist").check({ force: true }));
    cy.findByText("Er kontaktadressen din en vegadresse eller postboksadresse?")
      .should("exist")
      .closest("fieldset")
      .within(($radio) => cy.findByLabelText("Vegadresse").should("exist").check({ force: true }));
    cy.findByRole("textbox", { name: "Vegadresse" }).should("exist").type("Kirkegata 1");
    cy.findByRole("textbox", { name: "Postnummer" }).should("exist").type("1234");
    cy.findByRole("textbox", { name: "Poststed" }).should("exist").type("Nesvik");
    cy.findByRole("textbox", { name: "Fra hvilken dato skal denne adressen brukes (dd.mm.åååå)?" })
      .should("exist")
      .type("01.01.2020");

    if (expectVedleggspanel) {
      // Steg 2 -> Steg 3
      cy.clickNextStep();
      cy.findByRole("heading", { level: 2, name: "Vedlegg" }).should("exist");
      cy.findByLabelText("Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved.")
        .should("exist")
        .check({ force: true });
    }

    // Step 3 -> Oppsummering
    cy.clickNextStep();
    cy.findByRole("heading", { level: 2, name: "Oppsummering" }).should("exist");

    // Gå tilbake til skjema fra oppsummering, og naviger til oppsummering på nytt
    // for å verifisere at ingen valideringsfeil oppstår grunnet manglende verdier.
    cy.findByRoleWhenAttached("link", { name: "Forrige steg" }).should("exist").click();
    cy.findByRole("heading", { level: 2, name: "Oppsummering" }).should("not.exist");
    cy.clickNextStep();

    // Oppsummering
    cy.findByRole("heading", { level: 2, name: "Oppsummering" }).should("exist");
    cy.get("dl")
      .first()
      .within(() => {
        cy.get("dt").eq(0).should("contain.text", "Tittel");
        cy.get("dd").eq(0).should("contain.text", "Fru");
        cy.get("dt").eq(1).should("contain.text", "Fornavn");
        cy.get("dd").eq(1).should("contain.text", "Kari");
        cy.get("dt").eq(2).should("contain.text", "Etternavn");
        cy.get("dd").eq(2).should("contain.text", "Norman");
        cy.get("dt").eq(3).should("contain.text", "Har du norsk fødselsnummer eller D-nummer?");
        cy.get("dd").eq(3).should("contain.text", "Nei");
        cy.get("dt").eq(4).should("contain.text", "Din fødselsdato (dd.mm.åååå)");
        cy.get("dd").eq(4).should("contain.text", "10.5.1995");
      });
  };

  describe("Subscription method 'paper'", () => {
    beforeEach(() => {
      cy.visit("/fyllut/cypress101/skjema?sub=paper");
      cy.wait("@getCypress101");
    });

    it("visits the correct form", () => {
      cy.findByRole("heading", { name: "Skjema for Cucumber-testing" }).should("not.exist");
      cy.findByRole("heading", { name: "Skjema for Cypress-testing" }).should("exist");
    });

    describe("Step navigation", () => {
      it("navigates to step 2 when 'neste steg' is clicked", { defaultCommandTimeout: 10000 }, () => {
        cy.findByRole("heading", { level: 2, name: "Veiledning" }).should("exist");

        cy.clickNextStep();
        cy.findByRole("heading", { level: 2, name: "Dine opplysninger" }).should("exist");
      });

      it("validation errors stops navigation to step 3", () => {
        cy.clickNextStep();
        cy.clickNextStep();
        cy.findByRole("heading", { level: 2, name: "Dine opplysninger" });
        cy.findByText("For å gå videre må du rette opp følgende:").should("exist");

        cy.findAllByRole("link", { name: /^Du må fylle ut:/ }).should("have.length", 4);
        cy.findByRoleWhenAttached("link", { name: "Du må fylle ut: Fornavn" }).click();
        cy.findByRole("textbox", { name: "Fornavn" }).should("have.focus");
      });
    });

    describe("Fill in form", () => {
      it("fill in - go to summary - edit form - navigate back to summary", () => {
        fillInForm(true);
      });
    });
  });

  describe("Subscription method 'digital'", () => {
    beforeEach(() => {
      cy.visit("/fyllut/cypress101?sub=digital");
      cy.wait("@getCypress101");
    });

    describe("Fill in form", () => {
      it("fill in - go to summary - edit form - navigate back to summary", () => {
        cy.clickStart();
        fillInForm(false);
      });
    });
  });

  describe("Subscription method not specified in url", () => {
    beforeEach(() => {
      cy.visit("/fyllut/cypress101");
      cy.wait("@getCypress101");
    });

    describe("Fill in form", () => {
      it("select submission method paper - fill in - go to summary - edit form - navigate back to summary", () => {
        cy.get('[type="radio"]').check("paper");
        cy.clickStart();
        fillInForm(true);
      });
      it("select submission method digital - fill in - go to summary - edit form - navigate back to summary", () => {
        cy.get('[type="radio"]').check("digital");
        cy.clickStart();
        fillInForm(false);
      });
    });
  });
});