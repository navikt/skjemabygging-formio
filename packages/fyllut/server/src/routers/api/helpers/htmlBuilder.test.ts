import {
  ComponentType,
  FormSummaryComponent,
  FormSummaryPanel,
  NavFormType,
  SubmissionValue,
} from "@navikt/skjemadigitalisering-shared-domain";
import { body, createHtmlFromSubmission } from "./htmlBuilder";

const createPanel = (label: string, components: FormSummaryComponent[] = []) =>
  ({
    label,
    components,
    key: label,
    type: "panel",
  } as FormSummaryPanel);
const createComponent = (label: string, value: SubmissionValue, type: ComponentType = "textfield") =>
  ({
    label,
    value,
    type,
    key: label,
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

    it("adds fields for each second-level element in the array", () => {
      const bodyElement = body([
        createPanel("Panel", [createComponent("Field 1", "value 1"), createComponent("Field 2", "value 2")]),
      ]);
      expect(bodyElement).toContain('<div class="spm">Field 1</div>');
      expect(bodyElement).toContain('<div class="svar">- value 1</div>');
      expect(bodyElement).toContain('<div class="spm">Field 2</div>');
      expect(bodyElement).toContain('<div class="svar">- value 2</div>');
    });
  });
});
