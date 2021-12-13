import React from "react";
import {screen} from "@testing-library/react";
import {renderNavForm, setupNavFormio} from "../../test/navform-render";

describe("Templates", () => {

  beforeAll(setupNavFormio);

  describe("Et tekstfelt", () => {

    const formWithTextfield = textfieldProps => ({
      title: "Testskjema",
      components: [
        {
          label: "Fornavn",
          type: "textfield",
          key: "textfield",
          inputType: "text",
          input: true,
          ...textfieldProps,
        }
      ],
    });

    const i18n = {
      "en": {"Fornavn": "First name", "valgfritt": "optional"},
      "nb-NO": {"Fornavn": "Fornavn", "submit": "Lagre", "valgfritt": "valgfritt"}
    };

    describe("som ikke er required", () => {

      it("rendres med 'valgfritt' bak label på norsk", async () => {
        await renderNavForm({
          form: formWithTextfield({validate: {required: false}}),
          language: "nb-NO",
          i18n
        });
        const fornavnInput = await screen.findByLabelText("Fornavn (valgfritt)");
        expect(fornavnInput).toBeInTheDocument();
      });

      it("rendres med 'optional' bak label på engelsk", async () => {
        await renderNavForm({
          form: formWithTextfield({validate: {required: false}}),
          language: "en",
          i18n
        });
        const fornavnInput = await screen.findByLabelText("First name (optional)");
        expect(fornavnInput).toBeInTheDocument();
      });

    });

    describe("som er required", () => {

      it("rendres med 'valgfritt' bak label på norsk", async () => {
        await renderNavForm({
          form: formWithTextfield({validate: {required: true}}),
          language: "nb-NO",
          i18n
        });
        const fornavnInput = await screen.findByLabelText("Fornavn");
        expect(fornavnInput).toBeInTheDocument();
      });

      it("rendres med 'optional' bak label på engelsk", async () => {
        await renderNavForm({
          form: formWithTextfield({validate: {required: true}}),
          language: "en",
          i18n
        });
        const fornavnInput = await screen.findByLabelText("First name");
        expect(fornavnInput).toBeInTheDocument();
      });

    });

  });

});
