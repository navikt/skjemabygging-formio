import { fireEvent, screen } from "@testing-library/react";
import { renderNavForm, setupNavFormio } from "../../test/navform-render";

describe("Templates", () => {
  beforeAll(setupNavFormio);

  describe("Et tekstfelt", () => {
    const formWithTextfield = (textfieldProps) => ({
      title: "Testskjema",
      components: [
        {
          label: "Fornavn",
          type: "textfield",
          key: "textfield",
          inputType: "text",
          input: true,
          ...textfieldProps,
        },
      ],
    });

    const i18n = {
      en: { Fornavn: "First name", valgfritt: "optional" },
      "nb-NO": { Fornavn: "Fornavn", submit: "Lagre", valgfritt: "valgfritt" },
    };

    describe("som ikke er required", () => {
      it("rendres med 'valgfritt' bak label på norsk", async () => {
        await renderNavForm({
          form: formWithTextfield({ validate: { required: false } }),
          language: "nb-NO",
          i18n,
        });
        const fornavnInput = await screen.findByLabelText("Fornavn (valgfritt)");
        expect(fornavnInput).toBeInTheDocument();
      });

      it("rendres med 'optional' bak label på engelsk", async () => {
        await renderNavForm({
          form: formWithTextfield({ validate: { required: false } }),
          language: "en",
          i18n,
        });
        const fornavnInput = await screen.findByLabelText("First name (optional)");
        expect(fornavnInput).toBeInTheDocument();
      });
    });

    describe("som er required", () => {
      it("rendres ikke med 'valgfritt' bak label på norsk", async () => {
        await renderNavForm({
          form: formWithTextfield({ validate: { required: true } }),
          language: "nb-NO",
          i18n,
        });
        const fornavnInput = await screen.findByLabelText("Fornavn");
        expect(fornavnInput).toBeInTheDocument();
      });

      it("rendres ikke med 'optional' bak label på engelsk", async () => {
        await renderNavForm({
          form: formWithTextfield({ validate: { required: true } }),
          language: "en",
          i18n,
        });
        const fornavnInput = await screen.findByLabelText("First name");
        expect(fornavnInput).toBeInTheDocument();
      });
    });
  });

  describe("Utvidet beskrivelse ", () => {
    const buttonLabel = "Read more";
    const description = "Expanded text";
    const testShowAndHideByType = async (type, descriptionPosition, options = {}) => {
      await renderNavForm({
        form: {
          title: "Test",
          components: [
            {
              label: "Label",
              type,
              key: type,
              descriptionPosition,
              description: "Description",
              additionalDescription: true,
              additionalDescriptionLabel: buttonLabel,
              additionalDescriptionText: description,
              input: true,
              ...options,
            },
          ],
        },
      });

      const expandButton = screen.getByRole("button", { name: buttonLabel });
      expect(expandButton).toBeInTheDocument();

      const container = screen.getByText(description);
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass("navds-read-more__content--closed");

      fireEvent.click(expandButton);
      expect(container).not.toHaveClass("navds-read-more__content--closed");
    };

    describe("Textarea", () => {
      it("Default description position", async () => {
        await testShowAndHideByType("textarea");
      });

      it("Description position above", async () => {
        await testShowAndHideByType("textarea", "above");
      });
    });

    describe("Radiopanel", () => {
      it("Default description position", async () => {
        await testShowAndHideByType("radiopanel");
      });

      it("Description position above", async () => {
        await testShowAndHideByType("radiopanel", "above");
      });
    });

    describe("Selectboxes", () => {
      it("Default description position", async () => {
        await testShowAndHideByType("selectboxes");
      });

      it("Description position above", async () => {
        await testShowAndHideByType("selectboxes", "above");
      });
    });

    describe("Checkbox", () => {
      it("Default description position", async () => {
        await testShowAndHideByType("checkbox");
      });

      it("Description position above", async () => {
        await testShowAndHideByType("checkbox", "above");
      });
    });

    describe("Field", () => {
      it("Default description position", async () => {
        await testShowAndHideByType("field");
      });

      it("Description position above", async () => {
        await testShowAndHideByType("field", "above");
      });
    });

    describe("Number", () => {
      it("Default description position", async () => {
        await testShowAndHideByType("number");
      });

      it("Description position above", async () => {
        await testShowAndHideByType("number", "above");
      });
    });
  });
});
