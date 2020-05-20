import React from "react";
import FormEditorPage from "./FormEditorPage";
import {FakeBackendTestContext} from "./FakeBackendTestContext";
import FormBuilder from "./react-formio/FormBuilder";

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

  const renderOptions =  {
    createNodeMock: (element) => {
      if (element.props['data-testid'] === 'builderMountParent') {
        const mountNode = document.createElement('div');
        const result = document.createElement('div');
        result.appendChild(mountNode);
        return result;
      }
    }
  };

  it('should load the form from REST into the state', async () => {
    context.render(<FormEditorPage src="http://api.example.org/testForm" />, renderOptions);
    const editor = await context.waitForComponentToLoad(FormEditorPage);
    expect(editor.instance.state.form).toEqual(context.backend.form());
  });

  it('should render the form builder from loaded state', async () => {
    context.render(<FormEditorPage src="http://api.example.org/testForm" />, renderOptions);
    const editor = await context.waitForComponentToLoad(FormEditorPage);
    const builder = editor.findByType(FormBuilder);
    // await builder.instance.builder.ready; this never triggers, is the form always ready
    expect(editor.instance.state.form).toEqual(builder.instance.builder.instance.form);
  });
});
