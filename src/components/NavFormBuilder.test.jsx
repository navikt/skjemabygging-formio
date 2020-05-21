import React from "react";
import {FakeBackendTestContext} from "../testTools/FakeBackendTestContext";
import NavFormBuilder from "./NavFormBuilder";
import waitForExpect from "wait-for-expect";
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

  xit('should call onChange after the form has been built', async () => {
    context.render(<NavFormBuilder form={context.backend.form()} onChange={jest.fn()}/>, renderOptions);
    const formBuilder = context.testRenderer.root.findByType(NavFormBuilder);
    expect(formBuilder.props.form).toEqual(context.backend.form());
    // feiler her fordi vi ikke har funnet ut hvordan vi skal få formio til å bli ferdig.
    await waitForExpect(() => expect(formBuilder.props.onChange).toHaveBeenCalled());
  });
});