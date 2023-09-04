import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";

describe("Mellomlagring", () => {
  beforeEach(() => {
    cy.intercept("GET", "/api/config", { fixture: "config.json" }).as("getConfig");
    cy.intercept("GET", "/fyllut/api/forms/conditionalxmas", { fixture: "conditionalxmas.json" }).as(
      "getConditionalxmas"
    );
    cy.intercept("GET", "/fyllut/api/forms/testmellomlagring", { fixture: "test-mellomlagring.json" }).as(
      "getTestMellomlagringForm"
    );
  });

  describe('When submission method is "paper"', () => {
    beforeEach(() => {
      cy.intercept("POST", "/fyllut/api/send-inn/soknad*", cy.spy().as("createMellomlagringSpy"));
      cy.intercept("PUT", "/fyllut/api/send-inn/soknad*", cy.spy().as("updateMellomlagringSpy"));
    });
    // it("renders error if url has query param innsendingsId", () => {});

    it("does not fetch or update mellomlagring", () => {
      cy.visit("/fyllut/conditionalxmas?sub=paper");
      cy.wait("@getConditionalxmas");
      cy.clickStart();
      cy.get("@createMellomlagringSpy").should("not.have.been.called");
      cy.findByRole("group", { name: "Julemiddag" }).within(() => {
        cy.findByLabelText("Lutefisk").check({ force: true });
      });
      cy.clickNextStep();
      cy.get("@updateMellomlagringSpy").should("not.have.been.called");
      cy.clickNextStep();
      cy.clickNextStep();
      cy.findByRole("button", { name: TEXTS.grensesnitt.navigation.saveDraft }).should("not.exist");
      cy.findByRole("button", { name: TEXTS.grensesnitt.navigation.cancelAndDelete }).should("not.exist");
      cy.findByRole("link", { name: TEXTS.grensesnitt.summaryPage.editAnswers })
        .should("exist")
        .and("have.attr", "href", "/fyllut/conditionalxmas/veiledning?sub=paper");
    });

    // it("does not give you the option to save your application", () => {});
  });

  describe('When submission method is "digital"', () => {
    beforeEach(() => {
      cy.intercept("POST", "/fyllut/api/send-inn/soknad*", { fixture: "mellomlagring/create-xmas.json" }).as(
        "createMellomlagring"
      );
      cy.intercept("PUT", "/fyllut/api/send-inn/soknad*", { fixture: "mellomlagring/create-xmas.json" }).as(
        "updateMellomlagring"
      );
    });

    it("fetches and updates mellomlagring", () => {
      cy.visit("/fyllut/conditionalxmas?sub=digital");
      cy.wait("@getConditionalxmas");
      cy.clickStart();
      cy.wait("@createMellomlagring");
      cy.findByRole("group", { name: "Julemiddag" }).within(() => {
        cy.findByLabelText("Lutefisk").check({ force: true });
      });
      cy.clickNextStep();
      cy.wait("@updateMellomlagring");
      cy.clickNextStep();
      cy.wait("@updateMellomlagring");
      cy.clickNextStep();
      cy.wait("@updateMellomlagring");
      cy.findByRole("button", { name: TEXTS.grensesnitt.navigation.saveDraft }).should("exist");
      cy.findByRole("button", { name: TEXTS.grensesnitt.navigation.cancelAndDelete }).should("exist");
      cy.findByRole("link", { name: TEXTS.grensesnitt.summaryPage.editAnswers })
        .should("exist")
        .and(
          "have.attr",
          "href",
          "/fyllut/conditionalxmas/lutefisk?sub=digital&innsendingsId=75eedb4c-1253-44d8-9fde-3648f4bb1878#rotmos"
        );
    });
  });

  describe("When starting on the summary page", () => {
    it('redirects to start page if url does not contain "innsendingsId"', () => {
      cy.visit("http://localhost:3001/fyllut/testmellomlagring/oppsummering?sub=digital&lang=nb-NO");
      cy.wait("@getTestMellomlagringForm");
      cy.findByRole("heading", { name: TEXTS.statiske.introPage.title }).should("exist");
    });

    describe('When url contains query param "innsendingsId"', () => {
      beforeEach(() => {
        cy.intercept("GET", "/fyllut/api/send-inn/soknad/8e3c3621-76d7-4ebd-90d4-34448ebcccc3", {
          fixture: "mellomlagring/getTestMellomlagring-valid.json",
        }).as("getMellomlagringValid");

        cy.fixture("mellomlagring/submitTestMellomlagring.json").then((fixture) => {
          cy.intercept("PUT", "/fyllut/api/send-inn/utfyltsoknad", (req) => {
            const { submission: bodySubmission, ...bodyRest } = req.body;
            const { submission: fixtureSubmission, ...fixtureRest } = fixture;
            expect(bodySubmission.data).to.deep.contain(fixtureSubmission.data);
            expect(bodyRest).to.deep.eq(fixtureRest);
            req.redirect("/fyllut", 201);
          }).as("submitMellomlagring");
        });
      });

      it("retrieves mellomlagring and redirects after submitting", () => {
        cy.visit(
          "/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3&lang=nb-NO"
        );
        cy.wait("@getMellomlagringValid");
        cy.findByRole("heading", { name: TEXTS.statiske.summaryPage.title }).should("exist");
        cy.findByText("Ønsker du å få gaven innpakket").should("exist");
        cy.findByRole("button", { name: TEXTS.grensesnitt.navigation.saveAndContinue }).should("exist").click();
        cy.wait("@submitMellomlagring");
        cy.url().should("not.include", "testMellomlagring");
      });

      it("retrieves mellomlagring and lets you navigate to first empty panel", () => {
        cy.visit(
          "/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3&lang=nb-NO"
        );
        cy.wait("@getMellomlagringValid");
        cy.findByRole("heading", { name: TEXTS.statiske.summaryPage.title }).should("exist");
        cy.findByRole("link", { name: TEXTS.grensesnitt.summaryPage.editAnswers }).should("exist").click();
        cy.url().should("include", "/valgfrieOpplysninger");
        cy.findByRole("textbox", { name: "Hva drakk du til frokost (valgfritt)" }).should("have.focus");
      });
    });
  });
});
