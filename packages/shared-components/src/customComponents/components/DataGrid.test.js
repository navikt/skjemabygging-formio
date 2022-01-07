import {screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {defaultPanelProps, renderNavForm, setupNavFormio} from "../../../test/navform-render";

describe("NavDataGrid", () => {

  beforeAll(setupNavFormio);

  it("Legger til en ny rad som inneholder checkbox, og de kan velges uavhengig av hverandre", async () => {
    const form = {
      title: "NavDataGrid",
      display: "wizard",
      components: [
        {
          ...defaultPanelProps("Panel 1"),
          id: "e1phl2",
          components: [
            {
              label: "Data Grid",
              key: "datagrid",
              type: "datagrid",
              id: "ex4rnd",
              clearOnHide: true,
              input: true,
              isNavDataGrid: true,
              dataGridLabel: false,
              tree: true,
              components: [
                {
                  label: "Avkryssingsboks",
                  type: "navCheckbox",
                  key: "Avkryssingsboks",
                  id: "erhb2450000000000000000000000000000000",
                  input: true,
                  hideLabel: false,
                  clearOnHide: true,
                  validateOn: "blur",
                  dataGridLabel: true,
                  validate: {
                    required: true,
                  },
                }
              ],
            },
          ]
        }
      ]
    }
    await renderNavForm({form});
    expect(screen.queryAllByRole("checkbox", {name: "Avkryssingsboks"})).toHaveLength(1);

    const leggTilKnapp = await screen.findByRole("button", {name: "Legg til"});
    userEvent.click(leggTilKnapp);
    const checkboxes = screen.queryAllByRole("checkbox", {name: "Avkryssingsboks"});
    expect(checkboxes).toHaveLength(2);

    userEvent.click(checkboxes[1]);
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

});
