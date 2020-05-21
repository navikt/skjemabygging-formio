import React from "react";
import {FakeBackendTestContext} from "../FakeBackendTestContext";
import NavFormBuilder from "./NavFormBuilder";
const context = new FakeBackendTestContext();
context.setupBeforeAfter();

describe('FormEditorPage', () => {
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

  it('should load the form from REST into the state', async () => {
    context.render(<NavFormBuilder form={context.backend.form()}/>, renderOptions);
    const formBuilder = context.testRenderer.root.findByType(NavFormBuilder);
    expect(formBuilder.props.form).toEqual(context.backend.form());
  });
});