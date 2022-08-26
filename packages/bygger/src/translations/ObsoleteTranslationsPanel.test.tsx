import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import ObsoleteTranslationsPanel from "./ObsoleteTranslationsPanel";

describe("ObsoleteTranslationsPanel", () => {
  const obsoleteTranslations = [
    { id: "1", originalText: "Ja", translatedText: "Nei" },
    { id: "2", originalText: "Nei", translatedText: "No" },
    { id: "3", originalText: "Gul", translatedText: "Yellow" },
  ];

  let onDelete;

  const renderComponent = ({ translations, onDelete }) => {
    render(<ObsoleteTranslationsPanel translations={translations} onDelete={onDelete} />);
  };

  beforeEach(() => {
    onDelete = jest.fn();
    renderComponent({
      translations: obsoleteTranslations,
      onDelete,
    });
  });

  it("Panelets tittel inneholder antall ubrukte oversettelser", () => {
    const panelTitle = screen.getByRole("button", { name: "Antall ubrukte oversettelser: 3" });
    expect(panelTitle).toBeInTheDocument();
  });

  it("Viser ikke detaljer før panelet er åpnet", () => {
    const inputFields = screen.queryAllByRole("textbox");
    expect(inputFields).toHaveLength(0);
  });

  describe("Åpent panel", () => {
    beforeEach(() => {
      const panelTitle = screen.getByRole("button", { name: "Antall ubrukte oversettelser: 3" });
      userEvent.click(panelTitle);
    });

    it("Viser detaljer om ubrukte oversettelser", () => {
      const inputFields = screen.queryAllByRole("textbox");
      expect(inputFields).toHaveLength(3);
    });

    it("Sletter oversettelse når slett-knappen trykkes", () => {
      const deleteButton = screen.getAllByRole("button", { name: "Slett" })[1];
      expect(deleteButton).toBeInTheDocument();

      userEvent.click(deleteButton);
      expect(onDelete).toBeCalledTimes(1);
      expect(onDelete).toBeCalledWith(obsoleteTranslations[1]);
    });
  });
});
