import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { setupNavFormio } from "../../test/navform-render";
import { AppConfigProvider } from "../configContext";
import NavForm from "./NavForm";

const testFormWithStandardAndReactComponents = {
  title: "Testskjema med vanilla og React componenter",
  display: "wizard",
  type: "form",
  components: [
    {
      type: "panel",
      key: "panel1",
      label: "Panel 1",
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
        {
          label: "Dato (dd.mm.åååå)",
          type: "navDatepicker",
          key: "datepicker",
          input: true,
          dataGridLabel: true,
          validateOn: "blur",
          validate: {
            custom: "valid = instance.validateDatePickerV2(input, data, component, row);",
            required: true,
          },
        },
        {
          label: "IBAN",
          type: "iban",
          key: `iban`,
          fieldSize: "input--l",
          input: true,
          spellcheck: false,
          dataGridLabel: true,
          validateOn: "blur",
          clearOnHide: true,
          validate: {
            custom: "valid = instance.validateIban(input);",
            required: true,
          },
        },
      ],
    },
  ],
};

const testskjemaForOversettelser = {
  title: "Testskjema",
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
};

const featureToggles = { enableAutoComplete: true };

describe("NavForm", () => {
  beforeAll(setupNavFormio);

  const renderNavForm = async (props) => {
    const formReady = jest.fn();
    const renderReturn = render(
      <AppConfigProvider featureToggles={featureToggles}>
        <NavForm {...props} formReady={formReady} />
      </AppConfigProvider>
    );
    await waitFor(() => expect(formReady).toHaveBeenCalledTimes(1));
    return renderReturn;
  };

  describe("i18n", () => {
    it("should render norwegian label as specified in i18n", async () => {
      const i18n = { en: { Fornavn: "First name" }, "nb-NO": { Fornavn: "Fornavn", submit: "Lagre" } };
      await renderNavForm({
        form: testskjemaForOversettelser,
        language: "nb-NO",
        i18n,
      });
      const fornavnInput = await screen.findByLabelText("Fornavn");
      expect(fornavnInput).toBeInTheDocument();
    });

    it("should render the english label as specified in i18n", async () => {
      const i18n = { en: { Fornavn: "First name" }, "nb-NO": { Fornavn: "Fornavn", submit: "Lagre" } };
      await renderNavForm({
        form: testskjemaForOversettelser,
        language: "en",
        i18n,
      });
      const fornavnInput = await screen.findByLabelText("First name");
      expect(fornavnInput).toBeInTheDocument();
    });

    it("should change language from norwegian to english", async () => {
      const i18n = { en: { Fornavn: "First name" }, "nb-NO": { Fornavn: "Fornavn", submit: "Lagre" } };
      const { rerender } = await renderNavForm({
        form: testskjemaForOversettelser,
        language: "nb-NO",
        i18n,
      });
      expect(await screen.findByLabelText("Fornavn")).toBeInTheDocument();

      rerender(
        <AppConfigProvider featureToggles={featureToggles}>
          <NavForm form={testskjemaForOversettelser} language="en" i18n={i18n} />
        </AppConfigProvider>
      );
      expect(await screen.findByLabelText("First name")).toBeInTheDocument();
    });
  });

  describe("re-initializing with submission", () => {
    it("should load all values", async () => {
      const mockedOnSubmit = jest.fn();
      await renderNavForm({
        form: testFormWithStandardAndReactComponents,
        language: "nb-NO",
        submission: {
          data: {
            textfield: "Donald",
            datepicker: "2000-01-01",
            iban: "GB33BUKB20201555555555",
          },
        },
        onSubmit: mockedOnSubmit,
      });
      const textField = await screen.findByLabelText("Fornavn");
      expect(textField).toBeInTheDocument();
      expect(textField).toHaveValue("Donald");

      const datepicker = await screen.findByLabelText("Dato (dd.mm.åååå)");
      expect(datepicker).toBeInTheDocument();
      expect(datepicker).toHaveValue("01.01.2000");

      const ibanField = await screen.findByLabelText("IBAN");
      expect(ibanField).toBeInTheDocument();
      expect(ibanField).toHaveValue("GB33BUKB20201555555555");

      const nextLink = await screen.findByRole("button", { name: "Neste" });
      await userEvent.click(nextLink);
      await waitFor(() => expect(mockedOnSubmit).toHaveBeenCalled());
    });
  });
});
