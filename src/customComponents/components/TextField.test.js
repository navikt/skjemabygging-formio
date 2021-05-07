import {
  getByLabelText,
  // getByText,
  // getByTestId,
  // queryByTestId,
  // prettyDOM,
} from "@testing-library/dom";
import _ from "lodash";
import TextFieldComponent from "formiojs/components/textfield/TextField";
import Harness from "../../../test/harness";
import comp1 from "./fixtures/comp1";
import comp2 from "./fixtures/comp2";
import comp4 from "./fixtures/comp4";

/**
 * Det meste av denne testen er kopiert fra formiojs, og tester deres versjon av TextField
 */
describe("TextField", () => {
  it("Should create a new TextField", () => {
    const textField = new TextFieldComponent({
      label: "First Name",
      key: "firstName",
      input: true,
      type: "textfield",
    });

    expect(textField.component.key).toEqual("firstName");
  });

  it("Should build a TextField component", () => {
    return Harness.testCreate(TextFieldComponent, comp1).then(async (component) => {
      Harness.testElements(component, 'input[type="text"]', 1);
      // console.log(prettyDOM(component.element));
      component.setValue("Erna");
      const htmlInput = getByLabelText(component.element, comp1.label);
      expect(htmlInput.value).toEqual("Erna");
    });
  });

  it("Should disable multiple mask selector if component is disabled", (done) => {
    Harness.testCreate(TextFieldComponent, comp4).then((component) => {
      Harness.testElements(component, "[disabled]", 2);
      done();
    });
  });

  it("Should provide required validation", () => {
    return Harness.testCreate(
      TextFieldComponent,
      _.merge({}, comp2, {
        validate: { required: true },
      })
    )
      .then((component) => {
        return Harness.testInvalid(component, "", "firstName", "First Name is required").then(() => component);
      })
      .then((component) => {
        return Harness.testValid(component, "te").then(() => component);
      });
  });

  it("Should provide minLength validation", () => {
    return Harness.testCreate(
      TextFieldComponent,
      _.merge({}, comp2, {
        validate: { minLength: 2 },
      })
    )
      .then((component) => {
        return Harness.testInvalid(component, "t", "firstName", "First Name must have at least 2 characters.").then(
          () => component
        );
      })
      .then((component) => {
        return Harness.testValid(component, "te").then(() => component);
      });
  });
});
