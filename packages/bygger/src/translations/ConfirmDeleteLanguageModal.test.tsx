import { render, screen } from "@testing-library/react";
import React from "react";
import ConfirmDeleteLanguageModal from "./ConfirmDeleteLanguageModal";

describe("ConfirmDeleteLanguageModal", () => {
  const mockedCloseModal = jest.fn();
  const mockedOnConfirm = jest.fn();

  const renderModal = (language = "Norsk", isGlobal = false) => {
    render(
      <ConfirmDeleteLanguageModal
        isOpen={true}
        closeModal={mockedCloseModal}
        onConfirm={mockedOnConfirm}
        language={language}
        isGlobal={isGlobal}
      />
    );
  };

  beforeEach(() => {
    renderModal();
  });

  describe("When 'Slett språk' is clicked", () => {
    it("calls onConfirm ", async () => {
      await screen.getByRole("button", { name: "Slett språk" }).click();
      expect(mockedOnConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('When "Avbryt" is clocked', () => {
    it("calls closeModal", async () => {
      await screen.getByRole("button", { name: "Avbryt" }).click();
      expect(mockedCloseModal).toHaveBeenCalledTimes(1);
    });
  });

  describe("When modal is used with isGlobal flag being true", () => {
    beforeEach(() => {
      renderModal("Norsk", true);
    });

    it("displays text for global translations, with language in lowercase", async () => {
      const modalText = await screen.queryByText(
        'Ved å klikke på "slett språk" fjerner du alle oversettelser til norsk for dette skjemaet, for godt. Denne handlingen kan ikke angres.'
      );
      expect(modalText).toBeDefined();
    });
  });

  describe("When modal is used with isGlobal flag being false", () => {
    beforeEach(() => {
      renderModal("Svensk", true);
    });

    it("displays text for form translations, with language in lowercase", async () => {
      const modalText = await screen.queryByText(
        `Ved å klikke på "slett språk" fjerner du alle oversettelser til "svensk" for dette skjemaet, for godt. Denne handlingen kan ikke angres.`
      );
      expect(modalText).toBeDefined();
    });
  });
});
