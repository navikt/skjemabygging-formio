import * as formiojs from "formiojs";
import waitForExpect from "wait-for-expect";

beforeEach(() => {
  // jest.useFakeTimers();
});

afterEach(() => {
  // jest.useRealTimers();
});


it("renders the builder on the dom node", async () => {
  const div = document.createElement("div");
  const builder = new formiojs.FormBuilder(div, {}, {});
  const spy = jest.fn();
  builder.ready.then(spy);
  await waitForExpect(() => expect(spy).toHaveBeenCalled());
  const sidebar = div.querySelector('div.builder-sidebar');
  expect(sidebar).toBeVisible();
});