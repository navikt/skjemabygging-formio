import React from "react";
import FormEditorPage from "./FormEditorPage";
import {FakeBackendTestContext} from "./FakeBackendTestContext";

const context = new FakeBackendTestContext();
context.setupBeforeAfter();

describe('FormEditor', () => {
  let oldFormioFetch;
  beforeEach(() => {
    oldFormioFetch = Formio.fetch;
    Formio.fetch = global.fetch;
  });
  afterEach(() => {
    Formio.fetch = oldFormioFetch;
  });
  it('should load the form from REST into the state', async () => {
    context.render(<FormEditorPage src="http://api.example.org/testForm" />);
    const editor = await context.waitForComponentToLoad(FormEditorPage);
    expect(editor.instance.state.form).toEqual(context.backend.form());
  });

  it('should render the form builder from loaded state', async () => {
    context.render(<FormEditorPage src="http://api.example.org/testForm" />);
    const editor = await context.waitForComponentToLoad(FormEditorPage);

  });
});
