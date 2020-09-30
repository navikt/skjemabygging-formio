import React from "react";
import { render, screen } from "@testing-library/react";
import { ResultPage } from "./ResultPage";
import { BrowserRouter } from "react-router-dom";

test("Gå videre (til dokumentinnsending) er disabled før klikk på last ned", () => {
  render(
    <BrowserRouter>
      <ResultPage form={{}} submission={{}} />
    </BrowserRouter>
  );
  const dokumentinnsendingsButton = screen.getByRole("button", { name: "Gå videre" });
  expect(dokumentinnsendingsButton).toBeDisabled();
  const pdfButton = screen.getByRole("button", { name: "Last ned PDF" });
  pdfButton.click();
  expect(dokumentinnsendingsButton).not.toBeDisabled();
});
