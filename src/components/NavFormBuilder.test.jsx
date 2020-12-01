import React from "react";
import { FakeBackendTestContext } from "../testTools/frontend/FakeBackendTestContext";
import NavFormBuilder, { NakedNavFormBuilder } from "./NavFormBuilder";
import waitForExpect from "wait-for-expect";
import { isEqual, cloneDeep } from "lodash";
import columnsForm from "../../example_data/columnsForm.json";
import { Formio } from "formiojs";

const context = new FakeBackendTestContext();
context.setupBeforeAfter();

describe("NavFormBuilder", () => {
  let oldFormioFetch;
  let htmlDivElement;
  beforeEach(() => {
    oldFormioFetch = Formio.fetch;
    Formio.fetch = global.fetch;
    htmlDivElement = document.createElement("div");
    document.body.appendChild(htmlDivElement);
  });
  afterEach(() => {
    Formio.fetch = oldFormioFetch;
    document.body.removeChild(htmlDivElement);
  });

  const renderOptions = {
    createNodeMock: (element) => {
      if (element.props["data-testid"] === "builderMountElement") {
        return htmlDivElement;
      }
    },
  };

  it("is a learning test for lodash cloneDeep", () => {
    const deepClone = cloneDeep(context.backend.form());
    expect(deepClone).toEqual(context.backend.form());
    expect(isEqual(deepClone, context.backend.form())).toBeTruthy();
  });

  it("is a learing test for interaction between setTimeout, fakeTimers and wait for expect", async () => {
    let flesk = "bacon";
    setTimeout(() => (flesk = "duppe"), 5000);
    jest.advanceTimersByTime(5000);
    await waitForExpect(() => expect(flesk).toEqual("duppe"));
  });

  it("should call onChange after the form has been built", async () => {
    context.render(
      <NavFormBuilder form={context.backend.form()} onChange={jest.fn()} formBuilderOptions={{}} />,
      renderOptions
    );
    const formBuilder = await context.waitForComponent(NavFormBuilder);
    expect(formBuilder.props.form).toEqual(context.backend.form());
    jest.runAllTimers();
    await waitForExpect(() => expect(formBuilder.props.onChange).toHaveBeenCalled());
  });

  describe("Formio.js focused tests", () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const buildComponent = (builder, type, container) => {
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
        webformBuilder.onDrop(component, element, builderGroup);
      } else {
        return;
      }

      return webformBuilder;
    };

    const saveComponent = (builder) => {
      const click = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
      });

      const saveBtn = builder.instance.componentEdit.querySelector('[ref="saveButton"]');
      if (saveBtn) {
        saveBtn.dispatchEvent(click);
      }
    };

    it("add new component", async () => {
      context.render(<NavFormBuilder form={columnsForm} onChange={jest.fn()} />, renderOptions);
      const navFormBuilder = await context.waitForComponent(NakedNavFormBuilder);
      jest.runAllTimers();
      await waitForExpect(() => expect(navFormBuilder.props.onChange).toHaveBeenCalled());
      const formioJsBuilder = navFormBuilder.instance.builder;
      const column1 = htmlDivElement.querySelector('[ref="columns-container"]');
      buildComponent(formioJsBuilder, "textfield", column1);
      jest.advanceTimersByTime(150);
      saveComponent(formioJsBuilder);
      jest.advanceTimersByTime(150);
      const columns = formioJsBuilder.instance.webform.getComponent("columns");
      expect(columns.columns[0]).toHaveLength(1);
      jest.clearAllTimers();
    });
  });
});
