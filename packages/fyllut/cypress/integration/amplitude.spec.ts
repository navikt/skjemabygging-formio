/*
 * Tests for checking that Amplitude logging works.
 *
 * Initially only testing digital submission.
 * TODO: We should add tests for "paper" and "no submission" options as well, as they initiate "completed" logging individually.
 * TODO: Maybe we should also have tests for opening sub=digital or sub=paper directly, to see that the "skjema startet" logging is handled correctly.
 */

describe("Amplitude", () => {
  beforeEach(() => {
    cy.intercept("GET", "/fyllut/api/forms/cypress101", { fixture: "cypress101.json" }).as("getCypress101");
    cy.intercept("POST", "/collect-auto", { body: "success" }).as("amplitudeLogging");
    cy.intercept({ pathname: "/fyllut/api/send-inn", times: 1 }, { statusCode: 200 }).as("submitToSendinnSuccess");
    cy.intercept({ pathname: "/fyllut/api/send-inn", times: 1 }, { statusCode: 500 }).as("submitToSendinnFailed");
  });

  it("logs for all relevant events", () => {
    cy.visit("/fyllut/cypress101");
    cy.wait("@getCypress101");

    // Select digital submission and go to the form
    cy.get('[type="radio"]').check("digital");
    cy.clickStart();
    cy.checkLogToAmplitude("skjema åpnet");

    // Veiledning step
    cy.clickNextStep();
    cy.checkLogToAmplitude("skjemasteg fullført", { steg: 1 });

    // Dine opplysninger step
    cy.findByRole("combobox", { name: "Tittel" }).should("exist").click();
    cy.findByText("Fru").should("exist").click();
    cy.checkLogToAmplitude("skjema startet");
    cy.checkLogToAmplitude("skjemaspørsmål besvart", { spørsmål: "Tittel" });

    cy.findByRole("textbox", { name: "Fornavn" }).should("exist").type("Kari").blur();
    cy.checkLogToAmplitude("skjemaspørsmål besvart", { spørsmål: "Fornavn" });

    cy.findByRole("textbox", { name: "Etternavn" }).type("Norman").blur();
    cy.checkLogToAmplitude("skjemaspørsmål besvart", { spørsmål: "Etternavn" });

    // Radio panel is currently not reachable by role. Additionally {force: true} is needed here because
    // the input is overlapping with the label element, which makes cypress assume it's not interactable
    cy.get(".navds-radio-group")
      .first()
      .should("exist")
      .within(($radio) => cy.findByLabelText("Nei").should("exist").check({ force: true }));
    cy.checkLogToAmplitude("skjemaspørsmål besvart", { spørsmål: "Har du norsk fødselsnummer eller D-nummer?" });

    cy.findByRole("textbox", { name: "Din fødselsdato (dd.mm.åååå)" }).should("exist").type("10.05.1995").blur();
    cy.checkLogToAmplitude("skjemaspørsmål besvart", { spørsmål: "Din fødselsdato (dd.mm.åååå)" });

    cy.findByText("Bor du i Norge?")
      .should("exist")
      .closest("fieldset")
      .within(($radio) => cy.findByLabelText("Ja").should("exist").check({ force: true }));
    cy.checkLogToAmplitude("skjemaspørsmål besvart", { spørsmål: "Bor du i Norge?" });

    cy.findByText("Er kontaktadressen din en vegadresse eller postboksadresse?")
      .should("exist")
      .closest("fieldset")
      .within(($radio) => cy.findByLabelText("Vegadresse").should("exist").check({ force: true }));
    cy.checkLogToAmplitude("skjemaspørsmål besvart", {
      spørsmål: "Er kontaktadressen din en vegadresse eller postboksadresse?",
    });

    cy.findByRole("textbox", { name: "Vegadresse" }).should("exist").type("Kirkegata 1").blur();
    cy.checkLogToAmplitude("skjemaspørsmål besvart", { spørsmål: "Vegadresse" });

    cy.findByRole("textbox", { name: "Postnummer" }).should("exist").type("1234").blur();
    cy.checkLogToAmplitude("skjemaspørsmål besvart", { spørsmål: "Postnummer" });

    cy.findByRole("textbox", { name: "Poststed" }).should("exist").type("Nesvik").blur();
    cy.checkLogToAmplitude("skjemaspørsmål besvart", { spørsmål: "Poststed" });

    cy.findByRole("textbox", { name: "Fra hvilken dato skal denne adressen brukes (dd.mm.åååå)?" })
      .should("exist")
      .type("01.01.2020")
      .blur();
    cy.checkLogToAmplitude("skjemaspørsmål besvart", {
      spørsmål: "Fra hvilken dato skal denne adressen brukes (dd.mm.åååå)?",
    });

    // Step 2 -> Oppsummering
    cy.clickNextStep();
    cy.checkLogToAmplitude("skjemasteg fullført", { steg: 2 });
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

    // First attempt is intercepted and fails, so we can test "innsending feilet"
    cy.findByRole("button", { name: "Gå videre" }).click();
    cy.wait("@submitToSendinnFailed");
    cy.checkLogToAmplitude("skjemainnsending feilet");

    // The second attempt is successful, causing "skjema fullført"
    cy.findByRole("button", { name: "Gå videre" }).click();
    cy.wait("@submitToSendinnSuccess");
    cy.checkLogToAmplitude("skjema fullført", {
      innsendingsType: "digital",
      skjemaId: "cypress-101",
      skjemanavn: "Skjema for Cypress-testing",
    });
  });
});
