import { render, screen, within } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { AllForms } from "./AllForms";

const RESPONSE_HEADERS = {
  headers: {
    "content-type": "application/json",
  },
};

describe("AllForms", () => {
  beforeEach(() => {
    fetchMock.doMock();
  });

  it("Show loading when fetching forms from backend and show find no forms when there is no form fetched", async () => {
    fetchMock.mockImplementation((url) => {
      return Promise.resolve(new Response(JSON.stringify([]), RESPONSE_HEADERS));
    });

    render(
      <MemoryRouter initialEntries={["/fyllut"]}>
        <AllForms />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Laster..." })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Finner ingen skjemaer" })).toBeInTheDocument();
  });

  it("Show form lists when there are forms", async () => {
    const mockedForm = [
      { _id: "000", path: "newform", title: "New form", modified: "2021-11-30T14:10:21.487Z", properties: {} },
      {
        _id: "111",
        path: "testnewform",
        title: "Test new form",
        modified: "2021-11-29T14:10:21.487Z",
        properties: { innsending: "KUN_DIGITAL" },
      },
    ];
    fetchMock.mockImplementation((url) => {
      return Promise.resolve(new Response(JSON.stringify(mockedForm), RESPONSE_HEADERS));
    });

    render(
      <MemoryRouter initialEntries={["/fyllut"]}>
        <AllForms />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { name: "Velg et skjema" })).toBeInTheDocument();

    const formRow1 = screen.queryByRole("cell", { name: "New form" }).closest("tr");
    expect(formRow1).toBeInTheDocument();
    expect(within(formRow1).queryByRole("link", { name: "digital" })).toBeInTheDocument();
    expect(within(formRow1).queryByRole("link", { name: "papir" })).toBeInTheDocument();

    const formRow2 = screen.queryByRole("cell", { name: "Test new form" }).closest("tr");
    expect(formRow2).toBeInTheDocument();
    expect(within(formRow2).queryByRole("link", { name: "digital" })).toBeInTheDocument();
    expect(within(formRow2).queryByRole("link", { name: "papir" })).not.toBeInTheDocument();
  });
});
