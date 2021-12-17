import React from "react";
import { Formio } from "formiojs";
import Components from "formiojs/components/Components";
import {CustomComponents, NavForm, Template} from "../src/index.js";
import {render, waitFor} from "@testing-library/react";

const setupNavFormio = () => {
  Formio.use(Template);
  Components.setComponents(CustomComponents);
  new Formio("http://unittest.nav-formio-api.no");
}

const renderNavForm = async (props) => {
  const formReady = jest.fn();
  const renderReturn = render(
    <NavForm {...props} formReady={formReady}/>
);
  await waitFor(() => expect(formReady).toHaveBeenCalledTimes(1));
  return renderReturn;
}

const defaultPanelProps = label => ({
  type: "panel",
  label,
  title: label,
  key: label.replace(" ", "").toLowerCase(),
  input: false,
});

export {
  setupNavFormio,
  renderNavForm,
  defaultPanelProps
}