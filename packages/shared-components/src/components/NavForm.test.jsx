import React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import NavForm from "./NavForm";

const testskjemaForOversettelser = {
  title: "Testskjema",
  components: [
    {
      label: "Fornavn",
      type: "textfield",
      key: "textfield",
      inputType: "text",
      input: true
    }
  ],
};

describe("NavForm", () => {

  const renderNavForm = async (props) => {
    const formReady = jest.fn();
    const renderReturn = render(
      <NavForm {...props} formReady={formReady} />
    );
    await waitFor(() => expect(formReady).toHaveBeenCalledTimes(1));
    return renderReturn;
  }

  describe("i18n", () => {

    it("should render norwegian label as specified in i18n", async () => {
      const i18n = {"en": {"Fornavn": "First name"}, "nb-NO": {"Fornavn": "Fornavn", "submit": "Lagre"}};
      await renderNavForm({
        form: testskjemaForOversettelser,
        language: "nb-NO",
        i18n
      });
      const fornavnInput = await screen.findByLabelText("Fornavn");
      expect(fornavnInput).toBeInTheDocument();
    });

    it("should render the english label as specified in i18n", async () => {
      const i18n = {"en": {"Fornavn": "First name"}, "nb-NO": {"Fornavn": "Fornavn", "submit": "Lagre"}};
      await renderNavForm({
        form: testskjemaForOversettelser,
        language: "en",
        i18n
      });
      const fornavnInput = await screen.findByLabelText("First name");
      expect(fornavnInput).toBeInTheDocument();
    });

    it("should change language from norwegian to english", async () => {
      const i18n = {"en": {"Fornavn": "First name"}, "nb-NO": {"Fornavn": "Fornavn", "submit": "Lagre"}};
      const {rerender} = await renderNavForm({
        form: testskjemaForOversettelser,
        language: "nb-NO",
        i18n
      });
      expect(await screen.findByLabelText("Fornavn")).toBeInTheDocument();

      rerender(
        <NavForm
          form={testskjemaForOversettelser}
          language="en"
          i18n={i18n}
        />
      );
      expect(await screen.findByLabelText("First name")).toBeInTheDocument();
    });

  });

});
