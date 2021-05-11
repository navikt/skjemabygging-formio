import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RadioPanelGruppe, { RadioPanelGruppeWrapper } from "./RadioPanelGruppe";

const mockedTranslate = (value) => value;

const defaultComponent = {
  id: "comp-id",
  key: "comp-key",
  label: "Bor du i Norge?",
  description: "Beskrivelse av denne komponenten",
  descriptionPosition: undefined,
  values: [
    { label: "Ja", value: "ja" },
    { label: "Nei", value: "nei" },
  ],
  validate: {
    required: true,
  },
};

describe("RadioPanelGruppe", () => {
  test("Riktig verdi velges ved trykk på radioknapp", async () => {
    const onChange = jest.fn();
    render(<RadioPanelGruppeWrapper component={defaultComponent} onChange={onChange} translate={mockedTranslate} />);

    const radiobuttons = await screen.getByRole("group", { name: defaultComponent.label });
    await userEvent.click(within(radiobuttons).getByText("Ja"));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("ja"));
  });

  describe("Description", () => {
    const renderRadioPanelGruppe = (formioComponent) => {
      render(<RadioPanelGruppeWrapper component={formioComponent} onChange={jest.fn()} translate={mockedTranslate} />);
    };

    const getDescriptionElementWithinFieldset = async () => {
      const radiobuttons = await screen.getByRole("group", { name: defaultComponent.label });
      return within(radiobuttons).queryByText(defaultComponent.description);
    };

    test("Rendres inne i fieldset når position=undefined", async () => {
      renderRadioPanelGruppe({
        ...defaultComponent,
        descriptionPosition: undefined,
      });

      const description = await getDescriptionElementWithinFieldset();
      expect(description).not.toBeNull();
    });

    test("Rendres inne i fieldset når position=below", async () => {
      renderRadioPanelGruppe({
        ...defaultComponent,
        descriptionPosition: "below",
      });

      const description = await getDescriptionElementWithinFieldset();
      expect(description).not.toBeNull();
    });

    test("Rendres ikke inne i fieldset når position=above", async () => {
      renderRadioPanelGruppe({
        ...defaultComponent,
        descriptionPosition: "above",
      });

      const description = await getDescriptionElementWithinFieldset();
      expect(description).toBeNull();
    });

    test("Rendres over fieldset når position=above", async () => {
      renderRadioPanelGruppe({
        ...defaultComponent,
        descriptionPosition: "above",
      });

      const description = await screen.getByText(defaultComponent.description);
      expect(description).not.toBeNull();
      const fieldset = description.nextSibling;
      expect(fieldset).toHaveAttribute("aria-describedby", description["id"]);
    });
  });
});
