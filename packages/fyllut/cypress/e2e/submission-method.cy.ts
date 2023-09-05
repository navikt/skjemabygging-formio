describe("Submission method", () => {
  beforeEach(() => {
    cy.intercept("GET", "/fyllut/api/config", { fixture: "config.json" });
    cy.intercept("GET", "/fyllut/api/forms/bug101010", { fixture: "submission-method.json" }).as("getForm");
    cy.intercept("GET", "/fyllut/api/translations/bug101010", { fixture: "submission-method-translations.json" }).as(
      "getFormTranslations",
    );
    cy.intercept("GET", "/fyllut/api/global-translations/en", { fixture: "global-translation.json" }).as(
      "getGlobalTranslations",
    );
    cy.intercept("POST", "/collect-auto", { body: "success" }).as("amplitudeLogging");
  });

  describe("Subscription method 'digital'", () => {
    beforeEach(() => {
      cy.visit("/fyllut/bug101010/veiledning?sub=digital");
      cy.wait("@getForm");
      cy.wait("@getFormTranslations");
      cy.wait("@getGlobalTranslations");
    });

    it("Renders stepper without 'Vedlegg'", () => {
      cy.findByRole("navigation", { name: "Søknadssteg" })
        .should("exist")
        .within(() => {
          cy.findAllByRole("link").should("have.length", 3);
          cy.findByRole("link", { name: "Veiledning" }).should("exist");
          cy.findByRole("link", { name: "Dine opplysninger" }).should("exist");
          cy.findByRole("link", { name: "Vedlegg" }).should("not.exist");
          cy.findByRole("link", { name: "Oppsummering" }).should("exist");
        });
    });

    describe("Summary page", () => {
      beforeEach(() => {
        // fills out form and navigates to summary page
        cy.clickNextStep();
        cy.findByRole("textbox", { name: "Fornavn" }).should("exist").type("Test");
        cy.findByRole("textbox", { name: "Etternavn" }).should("exist").type("Testesen");
        cy.get(".navds-radio-group")
          .first()
          .should("exist")
          .within(() => cy.findByLabelText("Ja").should("exist").check({ force: true }));
        cy.findByRole("combobox", { name: "Hva søker du støtte til?" }).should("exist").type("Sykk{downArrow}{enter}");
        cy.clickNextStep();
        cy.findByRole("heading", { name: "Oppsummering" }).should("exist");
      });

      it("renders stepper without 'Vedlegg' on summary page", () => {
        cy.findByRole("navigation", { name: "Søknadssteg" })
          .should("exist")
          .within(() => {
            cy.findAllByRole("link").should("have.length", 3);
            cy.findByRole("link", { name: "Veiledning" }).should("exist");
            cy.findByRole("link", { name: "Dine opplysninger" }).should("exist");
            cy.findByRole("link", { name: "Vedlegg" }).should("not.exist");
            cy.findByRole("link", { name: "Oppsummering" }).should("exist");
          });
      });

      it("includes zero attachments, but has flag otherDocumentation", () => {
        cy.intercept("POST", "/fyllut/api/send-inn", (req) => {
          expect(req.body.attachments).to.have.length(0);
          expect(req.body.otherDocumentation).to.eq(true);
          req.reply(200);
        }).as("sendInn");

        // submit application
        cy.findByRole("button", { name: "Gå videre" }).click();
        cy.wait("@sendInn");
      });

      it("includes one attachment, and has flag otherDocumentation", () => {
        cy.intercept("POST", "/fyllut/api/send-inn", (req) => {
          expect(req.body.attachments).to.have.length(1);
          expect(req.body.otherDocumentation).to.eq(true);
          req.reply(200);
        }).as("sendInn");

        // edit data so that conditional attachment is triggered
        cy.findByRole("link", { name: "Rediger dine opplysninger" }).should("exist").click();
        cy.findByRole("combobox", { name: "Hva søker du støtte til?" }).should("exist").type("Brill{downArrow}{enter}");
        cy.findByRole("link", { name: "Oppsummering" }).click();

        // submit application
        cy.findByRole("button", { name: "Gå videre" }).click();
        cy.wait("@sendInn");
      });
    });
  });

  describe("Subscription method 'paper'", () => {
    beforeEach(() => {
      cy.visit("/fyllut/bug101010/veiledning?sub=paper");
      cy.wait("@getForm");
      cy.wait("@getFormTranslations");
      cy.wait("@getGlobalTranslations");
    });

    it("Renders stepper with 'Vedlegg'", () => {
      cy.findByRole("navigation", { name: "Søknadssteg" })
        .should("exist")
        .within(() => {
          cy.findAllByRole("link").should("have.length", 4);
          cy.findByRole("link", { name: "Veiledning" }).should("exist");
          cy.findByRole("link", { name: "Dine opplysninger" }).should("exist");
          cy.findByRole("link", { name: "Vedlegg" }).should("exist");
          cy.findByRole("link", { name: "Oppsummering" }).should("exist");
        });
    });
  });
});
