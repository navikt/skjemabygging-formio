describe("Custom react components", () => {
  beforeEach(() => {
    cy.intercept("GET", "/fyllut/api/config", { fixture: "config.json" }).as("getConfig");
    cy.intercept("GET", "/fyllut/api/forms/customcomps", { fixture: "custom-components.json" }).as("getForm");
    cy.intercept("GET", "/fyllut/api/translations/customcomps", { fixture: "custom-components-translations.json" }).as(
      "getTranslations",
    );
    cy.intercept("GET", "/fyllut/countries?lang=nb", { fixture: "countries.json" }).as("getCountries");
    cy.intercept("GET", "/fyllut/api/common-codes/currencies?lang=nb", { fixture: "currencies.json" }).as(
      "getCurrencies",
    );
    cy.intercept("GET", "/fyllut/api/global-translations/en", { fixture: "global-translation.json" }).as(
      "getGlobalTranslation",
    );
  });

  describe("Fill in form and view summary", () => {
    beforeEach(() => {
      cy.visit("/fyllut/customcomps/dineopplysninger?sub=paper");
      cy.wait("@getConfig");
      cy.wait("@getForm");
      cy.wait("@getGlobalTranslation");
      cy.wait("@getTranslations");
      cy.wait("@getCountries");
      cy.wait("@getCurrencies");
    });

    it("reflects changes on summary page when editing data", () => {
      cy.findByRole("heading", { name: "Dine opplysninger" });
      cy.findByRole("textbox", { name: "Fornavn" }).should("exist").type("Storm");
      cy.findByRole("combobox", { name: "I hvilket land bor du?" })
        .should("exist")
        .click()
        .type("Nor{downArrow}{downArrow}{downArrow}{downArrow}{enter}");
      cy.findByRole("combobox", { name: "Velg instrument (valgfritt)" }).should("exist").type("Gitar{enter}");
      cy.findByRole("textbox", { name: "Gyldig fra dato" }).should("exist").type("01.01.2023");
      cy.clickNextStep();

      cy.findAllByText("Du må fylle ut: Velg valuta").should("have.length", 2).first().click();
      cy.findByRole("combobox", { name: "Velg valuta" }).should("have.focus").type("{upArrow}{enter}");
      cy.clickNextStep();

      cy.findByRole("heading", { name: "Vedlegg" }).should("exist");
      cy.findByLabelText("Annen dokumentasjon")
        .should("exist")
        .within(() =>
          cy.findByLabelText("Ja, jeg legger det ved denne søknaden.").should("exist").check({ force: true }),
        );
      cy.findByLabelText("Bekreftelse på skoleplass")
        .should("exist")
        .within(() =>
          cy.findByLabelText("Jeg har levert denne dokumentasjonen tidligere").should("exist").check({ force: true }),
        );
      cy.clickNextStep();

      cy.findByRole("heading", { name: "Oppsummering" }).should("exist");
      cy.findByRole("heading", { name: "Dine opplysninger" }).should("exist");
      cy.get("dl")
        .first()
        .within(() => {
          cy.get("dt").eq(0).should("contain.text", "Fornavn");
          cy.get("dd").eq(0).should("contain.text", "Storm");
          cy.get("dt").eq(1).should("contain.text", "I hvilket land bor du?");
          cy.get("dd").eq(1).should("contain.text", "Norge");
          cy.get("dt").eq(2).should("contain.text", "Velg valuta");
          cy.get("dd").eq(2).should("contain.text", "Australske dollar (AUD)");
          cy.get("dt").eq(3).should("contain.text", "Velg instrument");
          cy.get("dd").eq(3).should("contain.text", "Gitar");
          cy.get("dt").eq(4).should("contain.text", "Gyldig fra dato");
          cy.get("dd").eq(4).should("contain.text", "1.1.2023");
        });

      cy.findByRole("link", { name: "Rediger dine opplysninger" }).click();
      cy.findByRole("heading", { name: "Dine opplysninger" }).should("exist");

      cy.findByRole("textbox", { name: "Fornavn" }).should("exist").type("zy");
      cy.findByRole("combobox", { name: "Velg valuta" }).click().should("have.focus").type("Norske{enter}");
      cy.findByRole("combobox", { name: "Velg instrument (valgfritt)" }).should("exist").type("{backspace}");
      cy.findByRole("textbox", { name: "Gyldig fra dato" }).should("exist").should("contain.value", "01.01.2023");
      cy.findByRole("navigation", { name: "Søknadssteg" })
        .should("exist")
        .within(() => {
          cy.findByRole("link", { name: "Oppsummering" }).click();
        });

      cy.findByRole("heading", { name: "Oppsummering" }).should("exist");
      cy.get("dl")
        .first()
        .within(() => {
          cy.get("dt").eq(0).should("contain.text", "Fornavn");
          cy.get("dd").eq(0).should("contain.text", "Stormzy");
          cy.get("dt").eq(1).should("contain.text", "I hvilket land bor du?");
          cy.get("dd").eq(1).should("contain.text", "Norge");
          cy.get("dt").eq(2).should("contain.text", "Velg valuta");
          cy.get("dd").eq(2).should("contain.text", "Norske kroner (NOK)");
          cy.get("dt").eq(3).should("contain.text", "Gyldig fra dato");
          cy.get("dd").eq(3).should("contain.text", "1.1.2023");
        });
    });
  });
});
