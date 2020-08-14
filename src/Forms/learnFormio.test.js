import * as formiojs from "formiojs";
import waitForExpect from "wait-for-expect";
import columnsForm from '../../example_data/columnsForm.json';

// import { queryBySelector } from "@testing-library/dom"
let builderElement;
let builder;
let spy;


beforeEach(() => {
  builderElement = document.createElement("div");
  document.body.appendChild(builderElement);
  builder = new formiojs.FormBuilder(builderElement, {}, {});
  spy = jest.fn();
  builder.ready.then(spy);
});

afterEach(() => {
  builder.instance.destroy(true);
  document.body.removeChild(builderElement);
  spy.mockRestore();
});

const buildComponent = (type, container) => {
  // Get the builder sidebar component.
  const webformBuilder = builder.instance;
  let builderGroup = null;
  let groupName = '';
  console.log(webformBuilder.groups);
  Object.entries(webformBuilder.groups).forEach(([key, group]) => {
    if (group.components[type]) {
      groupName = key;
      return false;
    }
  });

  if (!groupName) {
    return;
  }
  const openedGroup = document.getElementById(`group-${groupName}"`);
  if (openedGroup) {
    openedGroup.classList.remove('in');
  }
  const group = document.getElementById(`group-${groupName}`);
  group && group.classList.add('in');

  let component = webformBuilder.element.querySelector(`span[data-type='${type}']`);
  if (component) {
    component = component && component.cloneNode(true);
    const element = container || webformBuilder.element.querySelector('.drag-container.formio-builder-form');
    element.appendChild(component);
    builderGroup = document.getElementById(`group-container-${groupName}`);
    webformBuilder.onDrop(component, element, builderGroup);
  }
  else {
    return;
  }

  return webformBuilder;
}



it("renders the builder on the dom node", async () => {
  await waitForExpect(() => expect(spy).toHaveBeenCalled());
  const sidebar = builderElement.querySelector('div.builder-sidebar');
  expect(sidebar).toBeVisible();
  const basicPanel = sidebar.querySelector("[ref=group-panel-basic]");
  expect(basicPanel).toBeVisible();
  expect(basicPanel).not.toBeEmptyDOMElement()
});

it("adds a field to canvas", async () => {
  await builder.instance.setForm(columnsForm);
    const column1 = builder.instance.webform.element.querySelector('[ref="columns-container"]');
    buildComponent('textfield', column1);
    setTimeout(() => {
      Harness.saveComponent();
      setTimeout(() => {
        const columns = builder.instance.webform.getComponent('columns');
        assert.equal(columns.columns[0].length, 1);
        done();
      }, 150);
    }, 150)
});
