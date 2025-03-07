import { act, render } from '@testing-library/react';
import { Formio } from 'formiojs';
import { AppConfigProvider, NavForm } from '../src';

const setupNavFormio = () => {
  new Formio('http://unittest.nav-formio-api.no');
};

const NavFormForTest = (props) => {
  return (
    <AppConfigProvider dokumentinnsendingBaseURL={undefined} fyllutBaseURL={undefined}>
      <NavForm {...props} />
    </AppConfigProvider>
  );
};

const renderNavForm = async (props) => {
  const renderReturn = await act(async () => render(<NavFormForTest {...props} />));

  return { ...renderReturn, NavFormForTest };
};

const defaultPanelProps = (label) => ({
  type: 'panel',
  label,
  title: label,
  key: label.replace(' ', '').toLowerCase(),
  input: false,
});

export { defaultPanelProps, renderNavForm, setupNavFormio };
