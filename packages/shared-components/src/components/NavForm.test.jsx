import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { setupNavFormio } from "../../test/navform-render";
import { AppConfigProvider } from "../configContext";
import NavForm from "./NavForm";

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
});
