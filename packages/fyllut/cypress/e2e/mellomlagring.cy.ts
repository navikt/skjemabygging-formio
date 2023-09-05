import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";

describe("Mellomlagring", () => {
  beforeEach(() => {
    cy.intercept("GET", "/fyllut/api/config", { fixture: "config.json" }).as("getConfig");
    cy.intercept("GET", "/fyllut/api/forms/testmellomlagring", { fixture: "test-mellomlagring.json" }).as(
      "getTestMellomlagringForm"
    );
    cy.intercept("GET", "/fyllut/translations/testmellomlagring", { body: {} }).as("getTranslation");
  });

  describe('When submission method is "paper"', () => {
    beforeEach(() => {
      cy.intercept("POST", "/fyllut/api/send-inn/soknad*", cy.spy().as("createMellomlagringSpy"));
      cy.intercept("PUT", "/fyllut/api/send-inn/soknad*", cy.spy().as("updateMellomlagringSpy"));
    });

    it("does not fetch or update mellomlagring", () => {
      cy.visit("/fyllut/testmellomlagring?sub=paper");
      cy.wait("@getTestMellomlagringForm");
      cy.clickStart();
      cy.get("@createMellomlagringSpy").should("not.have.been.called");
      cy.findByRole("heading", { name: "Valgfrie opplysninger" }).should("exist");
      cy.clickNextStep();
      cy.get("@updateMellomlagringSpy").should("not.have.been.called");
      cy.findByRole("group", { name: "Ønsker du å få gaven innpakket" }).within(() => {
        cy.findByLabelText("Nei").check({ force: true });
      });
      cy.clickNextStep();
      cy.get("@updateMellomlagringSpy").should("not.have.been.called");
      cy.findByLabelText("Hvordan ønsker du å motta pakken?").click().type("På døra{enter}");
      cy.clickNextStep();
      cy.get("@createMellomlagringSpy").should("not.have.been.called");
      cy.clickNextStep();
      cy.findByRole("group", { name: "Annen dokumentasjon" }).within(() => {
        cy.findByLabelText("Ja, jeg legger det ved denne søknaden.").check({ force: true });
      });
      cy.findByRole("group", { name: "Oppmøtebekreftelse" }).within(() => {
        cy.findByLabelText("Jeg har levert denne dokumentasjonen tidligere").check({ force: true });
      });
      cy.findByRole("group", {
        name: "Bekreftelse på at du av helsemessige årsaker må benytte dyrere transport",
      }).within(() => {
        cy.findByLabelText("Jeg har levert denne dokumentasjonen tidligere").check({ force: true });
      });
      cy.clickNextStep();
      cy.findByRole("button", { name: TEXTS.grensesnitt.navigation.saveDraft }).should("not.exist");
      cy.findByRole("button", { name: TEXTS.grensesnitt.navigation.cancelAndDelete }).should("not.exist");
      cy.findByRole("link", { name: TEXTS.grensesnitt.summaryPage.editAnswers })
        .should("exist")
        .and("have.attr", "href", "/fyllut/testmellomlagring/valgfrieOpplysninger?sub=paper");
    });
  });

  describe('When submission method is "digital"', () => {
    beforeEach(() => {
      cy.intercept("POST", "/fyllut/api/send-inn/soknad*", {
        fixture: "mellomlagring/responseWithInnsendingsId.json",
      }).as("createMellomlagring");
      cy.intercept("PUT", "/fyllut/api/send-inn/soknad*", {
        fixture: "mellomlagring/responseWithInnsendingsId.json",
      }).as("updateMellomlagring");
      cy.intercept("GET", "/fyllut/api/send-inn/soknad/8e3c3621-76d7-4ebd-90d4-34448ebcccc3", {
        fixture: "mellomlagring/getTestMellomlagring-valid.json",
      }).as("getMellomlagringValid");
    });

    it("creates and updates mellomlagring", () => {
      cy.visit("/fyllut/testmellomlagring?sub=digital");
      cy.wait("@getTestMellomlagringForm");
      cy.clickStart();
      cy.wait("@createMellomlagring");
      cy.findByRole("heading", { name: "Valgfrie opplysninger" }).should("exist");
      cy.clickNextStep();
      cy.wait("@updateMellomlagring");
      cy.findByRole("group", { name: "Ønsker du å få gaven innpakket" }).within(() => {
        cy.findByLabelText("Nei").check({ force: true });
      });
      cy.clickNextStep();
      cy.wait("@updateMellomlagring");
      cy.findByLabelText("Hvordan ønsker du å motta pakken?").click().type("På døra{enter}");
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
          "/fyllut/testmellomlagring/valgfrieOpplysninger?sub=digital&innsendingsId=75eedb4c-1253-44d8-9fde-3648f4bb1878#hvaDrakkDuTilFrokost"
        );
    });

    it('fetches mellomlagring and navigates to "/summary" on start, when url contains "innsendingsId"', () => {
      cy.visit("/fyllut/testmellomlagring?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3&lang=nb-NO");
      cy.wait("@getMellomlagringValid");
      cy.findByRole("heading", { name: TEXTS.statiske.introPage.title }).should("exist");
      cy.clickStart();
      cy.findByRole("heading", { name: TEXTS.statiske.summaryPage.title }).should("exist");
    });

    describe("When starting on the summary page", () => {
      it('redirects to start page if url does not contain "innsendingsId"', () => {
        cy.visit("/fyllut/testmellomlagring/oppsummering?sub=digital&lang=nb-NO");
        cy.wait("@getTestMellomlagringForm");
        cy.findByRole("heading", { name: TEXTS.statiske.introPage.title }).should("exist");
      });

      describe('When url contains query param "innsendingsId"', () => {
        beforeEach(() => {
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
});
