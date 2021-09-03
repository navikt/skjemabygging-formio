import * as formiojs from "formiojs";
import waitForExpect from "wait-for-expect";
import columnsForm from "../../example_data/columnsForm.json";

describe("Formio.js replica", () => {
  let builderElement;
  let builder;
  let spy;

  beforeEach(() => {
    jest.useFakeTimers();
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
    jest.runAllTimers();
    jest.useRealTimers();
  });

  const buildComponent = (type, container) => {
    // Get the builder sidebar component.
    const webformBuilder = builder.instance;
    let builderGroup = null;
    let groupName = "";
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
      openedGroup.classList.remove("in");
    }
    const group = document.getElementById(`group-${groupName}`);
    group && group.classList.add("in");

    let component = webformBuilder.element.querySelector(`span[data-type='${type}']`);
    if (component) {
      component = component && component.cloneNode(true);
      const element = container || webformBuilder.element.querySelector(".drag-container.formio-builder-form");
      element.appendChild(component);
      builderGroup = document.getElementById(`group-container-${groupName}`);
      webformBuilder.onDrop(component, element, builderGroup); //Her settes det opp noen timere som skaper ball.
    } else {
      return;
    }

    return webformBuilder;
  };

  const saveComponent = () => {
    const click = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });

    const saveBtn = builder.instance.componentEdit.querySelector('[ref="saveButton"]');
    if (saveBtn) {
      saveBtn.dispatchEvent(click);
    }
  };

  it("renders the builder on the dom node", async () => {
    jest.runOnlyPendingTimers();
    await waitForExpect(() => expect(spy).toHaveBeenCalled());
    const sidebar = builderElement.querySelector("div.builder-sidebar");
    expect(sidebar).toBeVisible();
    const basicPanel = sidebar.querySelector("[ref=group-panel-basic]");
    expect(basicPanel).toBeVisible();
    expect(basicPanel).not.toBeEmptyDOMElement();
  });

  it("adds a field to canvas", async () => {
    jest.runOnlyPendingTimers();
    await builder.instance.setForm(columnsForm);
    const column1 = builder.instance.webform.element.querySelector('[ref="columns-container"]');
    buildComponent("textfield", column1);
    jest.runOnlyPendingTimers();
    jest.clearAllTimers(); // hack to stop crashing due to timer looping
    jest.advanceTimersByTime(150);
    saveComponent();
    jest.advanceTimersByTime(150);
    const columns = builder.instance.webform.getComponent("columns");
    expect(columns.columns[0]).toHaveLength(1);
  });
});
