import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { PrepareIngenInnsendingPage } from "./PrepareIngenInnsendingPage";

jest.mock("../context/languages", () => ({
  useLanguages: () => ({ translate: (text) => text }),
}));

describe("PrepareIngenInnsendingPage", () => {
  let submitCalls: React.SyntheticEvent<HTMLFormElement>[] = [];

  const submitEventListener = (event) => {
    event.preventDefault();
    submitCalls.push(event);
  };

  beforeAll(() => {
    window.addEventListener("submit", submitEventListener);
  });

  afterAll(() => {
    window.removeEventListener("submit", submitEventListener);
  });

  const testForm = {
    title: "Mitt testskjema",
    path: "testskjema",
    tags: ["nav-skjema"],
    name: "testskjema",
    type: "OPP",
    display: "wizard",
    properties: {
      skjemanummer: "",
      innsending: "INGEN",
      innsendingOverskrift: "Skriv ut skjemaet",
      innsendingForklaring: "Gi det til pasienten",
    },
    components: [],
  };

  beforeEach(() => {
    submitCalls = [];
    render(
      <MemoryRouter initialEntries={[`/forms/${testForm.path}/ingen-innsending`]}>
        <PrepareIngenInnsendingPage form={testForm} submission={{}} formUrl="/testskjema" translations={{}} />
      </MemoryRouter>
    );
  });

  test("Rendring av oppgitt overskrift og forklaring ved ingen innsending", () => {
    expect(screen.queryByRole("heading", { name: testForm.properties.innsendingOverskrift })).toBeTruthy();
    expect(screen.queryByText(testForm.properties.innsendingForklaring)).toBeTruthy();
  });

  test("Nedlasting av pdf", () => {
    const lastNedSoknadKnapp = screen.getByRole("button", { name: TEXTS.grensesnitt.downloadApplication });
    userEvent.click(lastNedSoknadKnapp);
    expect(submitCalls).toHaveLength(1);

    const submissionInput = submitCalls[0].target.children[0] as HTMLInputElement;
    expect(submissionInput.name).toEqual("submission");

    const formInput = submitCalls[0].target.children[1] as HTMLInputElement;
    expect(formInput.name).toEqual("form");
    const formInputValueJson = JSON.parse(formInput.value);
    expect(formInputValueJson.title).toEqual(testForm.title);
  });
});
