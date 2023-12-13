import Harness from '../../../../../test/harness.js';
import { setupNavFormio } from '../../../../../test/navform-render';
import Checkbox from './Checkbox.js';

const compDef = {
  label: 'Avkryssingsboks',
  type: 'navCheckbox',
  key: 'Avkryssingsboks',
  input: true,
  hideLabel: false,
  clearOnHide: true,
  validateOn: 'blur',
  validate: {
    required: true,
  },
};

describe('NavCheckbox', () => {
  beforeAll(setupNavFormio);

  it('Should build a checkbox component', () => {
    return Harness.testCreate(Checkbox, compDef).then((component) => {
      const inputs = Harness.testElements(component, 'input[type="checkbox"]', 1);
      for (let i = 0; i < inputs.length; i++) {
        expect(inputs[i].getAttribute('class').indexOf('navds-checkbox__input') !== -1).toBeTruthy();
        expect(inputs[i].name).toBe(`data[${compDef.key}]`);
      }
      Harness.testElements(component, 'label', 1);
    });
  });

  it('Label is rendered', () => {
    return Harness.testCreate(Checkbox, compDef).then((component) => {
      const labels = component.element.querySelectorAll('label');
      expect(labels).toHaveLength(1);
    });
  });

  it('Should be able to unselect a checkbox component with the radio input type', () => {
    return Harness.testCreate(Checkbox, compDef).then((component) => {
      const input = Harness.testElement(component, 'input', 1);
      Harness.clickElement(component, input);
      expect(input.checked).toBe(true);
      Harness.clickElement(component, input);
      expect(input.checked).toBe(false);
    });
  });
});
