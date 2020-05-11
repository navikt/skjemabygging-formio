import React from "react";
import FormEditorPage from "./FormEditorPage";
import {TestContext} from "./testTools";

const context = new TestContext();
context.setupBeforeAfter();

describe('FormEditor', () => {
  it('should load the form into the form builder', async () => {
    context.render(<FormEditorPage src="http://www.example.org/flesk/flesk" />);
    const editor = await context.waitForComponentToLoad(FormEditorPage);
    console.log(editor);
  });
});
