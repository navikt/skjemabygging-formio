import * as formiojs from "formiojs";
import waitForExpect from "wait-for-expect";
// import { queryBySelector } from "@testing-library/dom"
let div;
let builder;
let spy;


beforeEach(() => {
  div = document.createElement("div");
  builder = new formiojs.FormBuilder(div, {}, {});
  spy = jest.fn();
  builder.ready.then(spy);
});

afterEach(() => {
  builder.instance.destroy(true);
  div.remove();
  spy.mockRestore();
});


it("renders the builder on the dom node", async () => {
  await waitForExpect(() => expect(spy).toHaveBeenCalled());
  const sidebar = div.querySelector('div.builder-sidebar');
  expect(sidebar).toBeVisible();
  const basicPanel = sidebar.querySelector("[ref=group-panel-basic]");
  expect(basicPanel).toBeVisible();
  expect(basicPanel).not.toBeEmptyDOMElement()
});

it("adds a field to canvas", async () => {

});
