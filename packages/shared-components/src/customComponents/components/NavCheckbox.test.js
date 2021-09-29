import Harness from "../../../test/harness";
import NavCheckbox from "./NavCheckbox";

const compDef = {
  label: "Avkryssingsboks",
  type: "navCheckbox",
  key: "Avkryssingsboks",
  input: true,
  hideLabel: false,
  clearOnHide: true,
  validateOn: "blur",
  validate: {
    required: true,
  },
};

describe('NavCheckbox', () => {

  it('Should build a checkbox component', () => {
    return Harness.testCreate(NavCheckbox, compDef).then((component) => {
      const inputs = Harness.testElements(component, 'input[type="checkbox"]', 1);
      for (let i=0; i < inputs.length; i++) {
        expect(inputs[i].getAttribute('class').indexOf('form-check-input') !== -1).toBeTruthy();
        expect(inputs[i].name).toEqual(`data[${compDef.key}]`);
      }
      Harness.testElements(component, 'span', 1);
    });
  });

  it('Label is rendered', () => {
    return Harness.testCreate(NavCheckbox, compDef).then((component) => {
      const labels = component.element.querySelectorAll('label');
      expect(labels).toHaveLength(1);
    });
  });

  it('Should be able to unselect a checkbox component with the radio input type', () => {
    return Harness.testCreate(NavCheckbox, compDef).then((component) => {
      const input = Harness.testElement(component, 'input', 1);
      Harness.clickElement(component, input);
      expect(input.checked).toBe(true);
      Harness.clickElement(component, input);
      expect(input.checked).toBe(false);
    });
  });

});
