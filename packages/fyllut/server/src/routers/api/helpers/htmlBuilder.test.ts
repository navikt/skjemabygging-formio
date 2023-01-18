import {
  ComponentType,
  ContainerType,
  FormSummaryComponent,
  FormSummaryContainer,
  FormSummaryPanel,
  NavFormType,
  SubmissionValue,
} from "@navikt/skjemadigitalisering-shared-domain";
import { body, createHtmlFromSubmission } from "./htmlBuilder";

const createContainer = (label: string, type: ContainerType, components: FormSummaryComponent[] = []) =>
  ({
    label,
    components,
    key: label,
    type,
  } as FormSummaryContainer);

const createPanel = (label: string, components: FormSummaryComponent[] = []) =>
  createContainer(label, "panel", components) as FormSummaryPanel;

const createComponent = (
  label: string,
  value: SubmissionValue,
  type: ComponentType = "textfield",
  optionalProps = {}
) =>
  ({
    label,
    value,
    type,
    key: label,
    ...optionalProps,
  } as FormSummaryComponent);

describe("htmlBuilder", () => {
  describe("Html document", () => {
    const formWithTitle = { title: "Abc def", components: [] } as unknown as NavFormType;
    let html: String;

    beforeEach(() => {
      html = createHtmlFromSubmission(formWithTitle, {}, {}, true);
    });

    it("creates a html document with the forms title", () => {
      expect(html).toContain("<title>Abc def</title>");
    });

    it("sets norsk Bokmål as language by default", () => {
      expect(html).toContain('xml:lang="nb-NO"');
      expect(html).toContain('lang="nb-NO"');
    });

    it("sets the language from parameter", () => {
      html = createHtmlFromSubmission(formWithTitle, {}, {}, true, "languageCode");
      expect(html).toContain('xml:lang="languageCode"');
      expect(html).toContain('lang="languageCode"');
    });
  });

  describe("Fields from form and submission", () => {
    const panels = [createPanel("Panel 1"), createPanel("Panel 2"), createPanel("Panel 3")];

    it("adds headers for each top level element in the array", () => {
      const bodyElement = body(panels).replace("\n", "");
      expect(bodyElement).toContain("<h2>Panel 1</h2>");
      expect(bodyElement).toContain("<h2>Panel 2</h2>");
      expect(bodyElement).toContain("<h2>Panel 3</h2>");
    });

    it("adds fields for each element with a field type in the array", () => {
      const bodyElement = body([
        createPanel("Panel", [createComponent("Field 1", "value 1"), createComponent("Field 2", "value 2")]),
      ]);
      expect(bodyElement).toContain('<div class="spm">Field 1</div>');
      expect(bodyElement).toContain('<div class="svar">- value 1</div>');
      expect(bodyElement).toContain('<div class="spm">Field 2</div>');
      expect(bodyElement).toContain('<div class="svar">- value 2</div>');
    });
  });

  describe("Container types", () => {
    describe("fieldset", () => {
      it("adds the fields contained by the fieldset", () => {
        const bodyElement = body([
          createPanel("Panel", [createContainer("Fieldset", "fieldset", [createComponent("Field", "value")])]),
        ]);

        expect(bodyElement).toContain("<h2>Panel</h2>");
        expect(bodyElement).not.toContain("<h2>Fieldset</h2>");
        expect(bodyElement).toContain('<div class="spm">Field</div>');
        expect(bodyElement).toContain('<div class="svar">- value</div>');
      });
    });

    describe("datagrid", () => {
      let bodyElement: string;

      beforeEach(() => {
        bodyElement = body([
          createPanel("Panel", [createContainer("My datagrid", "datagrid", [createComponent("Field", "value")])]),
        ]);
      });

      it("adds indentation for fields inside datagrid", () => {
        expect(bodyElement).toContain('<div class="innrykk">');
      });

      it("adds an h3 with the datagrid label", () => {
        expect(bodyElement).toContain("<h3>My datagrid</h3>");
      });

      describe("Containing datagrid rows", () => {
        beforeEach(() => {
          bodyElement = body([
            createPanel("Panel", [
              createContainer("My datagrid", "datagrid", [
                createContainer("My datagrid row 1", "datagrid-row", [createComponent("Field 1", "value 1")]),
                createContainer("My datagrid row 2", "datagrid-row", [createComponent("Field 2", "value 2")]),
              ]),
            ]),
          ]);
        });

        it("displays the datagrid row labels", () => {
          expect(bodyElement).toContain("My datagrid row 1");
          expect(bodyElement).toContain("My datagrid row 2");
        });

        it("displays the contained fields", () => {
          expect(bodyElement).toContain('<div class="spm">Field 1</div>');
          expect(bodyElement).toContain('<div class="svar">- value 1</div>');
          expect(bodyElement).toContain('<div class="spm">Field 2</div>');
          expect(bodyElement).toContain('<div class="svar">- value 2</div>');
        });

        it("does not add a second indentation", () => {
          expect(bodyElement.split('<div class="innrykk">')).toHaveLength(2);
        });
      });

      describe("Containing a datagrid row with a skjemagruppe", () => {
        beforeEach(() => {
          bodyElement = body([
            createPanel("Panel", [
              createContainer("My datagrid", "datagrid", [
                createContainer("My datagrid row", "datagrid-row", [
                  createContainer("Skjemagruppe inside datagrid", "navSkjemagruppe", [
                    createComponent("Field", "value"),
                  ]),
                ]),
              ]),
            ]),
          ]);
        });

        it("adds double indentation", () => {
          expect(bodyElement.split('<div class="innrykk">')).toHaveLength(3);
        });

        it("adds an h4 with the skjemagruppe label, in addition to an h3 and the row label", () => {
          expect(bodyElement).toContain("<h3>My datagrid</h3>");
          expect(bodyElement).toContain("My datagrid row");
          expect(bodyElement).toContain("<h4>Skjemagruppe inside datagrid</h4>");
        });

        it("adds the fields in the skjemagruppe", () => {
          expect(bodyElement).toContain('<div class="spm">Field</div>');
          expect(bodyElement).toContain('<div class="svar">- value</div>');
        });
      });
    });

    describe("navSkjemagruppe", () => {
      let bodyElement: string;

      beforeEach(() => {
        bodyElement = body([
          createPanel("Panel", [
            createContainer("My skjemagruppe", "navSkjemagruppe", [createComponent("Field", "value")]),
          ]),
        ]);
      });

      it("adds indentation for fields inside navSkjemagruppe", () => {
        expect(bodyElement).toContain('<div class="innrykk">');
      });

      it("adds an h3 with the skjemagruppe label", () => {
        expect(bodyElement).toContain("<h3>My skjemagruppe</h3>");
      });

      describe("Containing a navSkjemagruppe", () => {
        beforeEach(() => {
          bodyElement = body([
            createPanel("Panel", [
              createContainer("Skjemagruppe level 1", "navSkjemagruppe", [
                createContainer("Skjemagruppe level 2", "navSkjemagruppe", [createComponent("Field", "value")]),
              ]),
            ]),
          ]);
        });

        it("adds double indentation for navSkjemagruppe inside a navSkjemagruppe", () => {
          expect(bodyElement.split('<div class="innrykk">')).toHaveLength(3);
        });

        it("adds the h3 for the first skjemagruppe label, and an h4 for the second skjemagruppe", () => {
          expect(bodyElement).toContain("<h3>Skjemagruppe level 1</h3>");
          expect(bodyElement).toContain("<h4>Skjemagruppe level 2</h4>");
        });
      });
    });
  });

  describe("Special types", () => {
    describe("image", () => {
      it("Adds label image tag and alt text", () => {
        const bodyElement = body([
          createPanel("Panel", [
            createComponent("This is an image", "data:image/png;base64,image", "image", {
              alt: "alt text",
              widthPercent: 40,
            }),
          ]),
        ]);
        expect(bodyElement).toContain('<div class="spm">This is an image</div>');
        expect(bodyElement).toContain('<img src="data:image/png;base64,image" alt="alt text" width="200"/>');
        expect(bodyElement).toContain('<div class="alt">alt text</div>');
      });
    });
  });
});
