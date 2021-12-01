import { render, screen } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { AllForms } from "./AllForms";

describe("AllForms", () => {
  it("Show loading when fetching forms from backend and show find no forms when there is no form fetched", async () => {
    fetchMock.mockImplementation((url) => {
      return Promise.resolve(new Response(JSON.stringify([])));
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
      { _id: "000", path: "newform", title: "New form", modified: "2021-11-30T14:10:21.487Z" },
      { _id: "111", path: "testnewform", title: "Test new form", modified: "2021-11-29T14:10:21.487Z" },
    ];
    fetchMock.mockImplementation((url) => {
      return Promise.resolve(new Response(JSON.stringify(mockedForm)));
    });

    render(
      <MemoryRouter initialEntries={["/fyllut"]}>
        <AllForms />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { name: "Velg et skjema" })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "New form" })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Test new form" })).toBeInTheDocument();
  });
});
