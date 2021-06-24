import React from "react";
import { render } from "@testing-library/react";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

const fisk = { _id: "fisk", title: "fisk", path: "fisk" };
const flesk = { _id: "flesk", title: "flesk", path: "flesk" };

test("renders Velg et skjema", () => {
  const { getByText } = render(
    <BrowserRouter>
      <App forms={[fisk, flesk]} />
    </BrowserRouter>
  );
  const linkElement = getByText(/Velg et skjema/i);
  expect(linkElement).toBeInTheDocument();
});
