import React from "react";
import {FakeBackendTestContext} from "../testTools/FakeBackendTestContext";
import NavFormBuilder from "./NavFormBuilder";
import waitForExpect from "wait-for-expect";
import {isEqual, cloneDeep} from "lodash";

const context = new FakeBackendTestContext();
context.setupBeforeAfter();

describe('NavFormBuilder', () => {
  let oldFormioFetch;
  beforeEach(() => {
    oldFormioFetch = Formio.fetch;
    Formio.fetch = global.fetch;
  });
  afterEach(() => {
    Formio.fetch = oldFormioFetch;
  });

  const renderOptions = {
    createNodeMock: (element) => {
      if (element.props['data-testid'] === 'builderMountElement') {
        return document.createElement('div');
      }
    }
  };

  it('is a learning test for lodash cloneDeep', () => {
    const deepClone = cloneDeep(context.backend.form());
    expect(deepClone).toEqual(context.backend.form());
    expect(isEqual(deepClone, context.backend.form())).toBeTruthy();
  });

  it('is a learing test for interaction between setTimeout, fakeTimers and wait for expect', async () => {
    let flesk = 'bacon';
    setTimeout(() => flesk = 'duppe', 5000);
    jest.advanceTimersByTime(5000);
    await waitForExpect(() => expect(flesk).toEqual('duppe'));
  });

  it('should call onChange after the form has been built', async () => {
    context.render(<NavFormBuilder form={context.backend.form()} onChange={jest.fn()}/>, renderOptions);
    const formBuilder = context.testRenderer.root.findByType(NavFormBuilder);
    expect(formBuilder.props.form).toEqual(context.backend.form());
    // hvorfor vil ikke formio bli ready mens vi bruker fake timers??
    jest.useRealTimers();
    await waitForExpect(() => expect(formBuilder.props.onChange).toHaveBeenCalled());
    jest.useFakeTimers();
  });
});