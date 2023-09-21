import { render, waitFor } from "@testing-library/react";
import { Formio } from "formiojs";
import { AppConfigProvider, NavForm } from "../src";

const setupNavFormio = () => {
  new Formio("http://unittest.nav-formio-api.no");
};

const NavFormForTest = (props) => {
  return (
    <AppConfigProvider dokumentinnsendingBaseURL={undefined} fyllutBaseURL={undefined}>
      <NavForm {...props} />
    </AppConfigProvider>
  );
};

const renderNavForm = async (props) => {
  const formReady = vi.fn();
  const renderReturn = render(<NavFormForTest {...props} formReady={formReady} />);
  await waitFor(() => expect(formReady).toHaveBeenCalledTimes(1));
  return { ...renderReturn, NavFormForTest };
};

const defaultPanelProps = (label) => ({
  type: "panel",
  label,
  title: label,
  key: label.replace(" ", "").toLowerCase(),
  input: false,
});

export { setupNavFormio, renderNavForm, defaultPanelProps };
