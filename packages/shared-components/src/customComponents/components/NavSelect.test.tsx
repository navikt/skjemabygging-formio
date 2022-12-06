import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderNavForm, setupNavFormio } from "../../../test/navform-render";

describe("NavSelect", () => {
  beforeAll(setupNavFormio);

  const testForm = {
    title: "Testskjema",
    type: "form",
    display: "wizard",
    components: [
      {
        title: "Første panel",
        type: "panel",
        components: [
          {
            label: "Velg frukt",
            uniqueOptions: false,
            tableView: true,
            dataSrc: "values",
            data: {
              values: [
                {
                  label: "Eple",
                  value: "eple",
                },
                {
                  label: "Banan",
                  value: "banan",
                },
                {
                  label: "Persimon",
                  value: "persimon",
                },
              ],
              resource: "",
              json: "",
              url: "",
              custom: "",
            },
            idPath: "id",
            limit: 100,
            template: "<span>{{ item.label }}</span>",
            clearOnRefresh: false,
            searchEnabled: true,
            selectThreshold: 0.3,
            readOnlyValue: false,
            customOptions: {},
            useExactSearch: false,
            validateOn: "blur",
            validate: {
              onlyAvailableItems: false,
              required: true,
            },
            key: "velgFrukt",
            type: "navSelect",
            indexeddb: {
              filter: {},
            },
            searchDebounce: 0.3,
            minSearch: 0,
            lazyLoad: true,
            authenticate: false,
            ignoreCache: false,
            fuseOptions: {
              include: "score",
              threshold: 0.3,
            },
            input: true,
            dataGridLabel: true,
          },
        ],
      },
      {
        title: "Andre panel",
        type: "panel",
        components: [
          {
            label: "Fornavn",
            type: "textfield",
            key: "textfield",
            inputType: "text",
            input: true,
            validate: {
              required: true,
            },
          },
        ],
      },
    ],
  };

  describe("", () => {
    it("selects item", async () => {
      await renderNavForm({
        form: testForm,
      });
      const nedtrekksliste = screen.getByLabelText(/Velg frukt.*/) as HTMLInputElement;
      expect(nedtrekksliste).toBeInTheDocument();
      expect(nedtrekksliste.value).toBe("");

      userEvent.click(nedtrekksliste);
      const optionPersimon = await screen.findByText("Persimon");
      userEvent.click(optionPersimon);

      screen.debug();
      await waitFor(() => {
        const valgtFrukt = screen.getByText("Persimon");
        expect(valgtFrukt).toBeInTheDocument();
      });
    });

    it("shows error message when validation fails", async () => {
      await renderNavForm({
        form: testForm,
      });
      const nedtrekksliste = screen.getByLabelText(/Velg frukt.*/) as HTMLInputElement;
      expect(nedtrekksliste).toBeInTheDocument();

      const nextButton = screen.getByRole("button", { name: "Neste steg" });
      expect(nextButton).toBeInTheDocument();
      nextButton.click();

      const errorMessages = await screen.findAllByText("Du må fylle ut: Velg frukt");
      expect(errorMessages).toHaveLength(2); // på toppen av siden, og nedenfor input-feltet
    });
  });
});
