import { render, waitFor } from "@testing-library/react";
import { Formio } from "formiojs";
import Components from "formiojs/components/Components";
import React from "react";
import { CustomComponents, NavForm, Template } from "../src";
import { AppConfigProvider } from "../src/configContext";

const setupNavFormio = () => {
  Formio.use(Template);
  Components.setComponents(CustomComponents);
  new Formio("http://unittest.nav-formio-api.no");
};

const featureToggles = { enableAutoComplete: true };

const renderNavForm = async (props) => {
  const formReady = jest.fn();
  const renderReturn = render(
    <AppConfigProvider featureToggles={featureToggles} dokumentinnsendingBaseURL={undefined} fyllutBaseURL={undefined}>
      <NavForm {...props} formReady={formReady} />
    </AppConfigProvider>
  );
  await waitFor(() => expect(formReady).toHaveBeenCalledTimes(1));
  return renderReturn;
};

const defaultPanelProps = (label) => ({
  type: "panel",
  label,
  title: label,
  key: label.replace(" ", "").toLowerCase(),
  input: false,
});

export { setupNavFormio, renderNavForm, defaultPanelProps };
