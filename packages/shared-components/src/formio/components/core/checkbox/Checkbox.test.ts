import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import form from '../../../../../../../mocks/mocks/data/formio-api/custom-components-checkbox.json';
import { renderNavForm, setupNavFormio } from '../../../../../test/navform-render';

describe('NavCheckbox', () => {
  beforeAll(setupNavFormio);

  it('should update checked value', async () => {
    await renderNavForm({
      form,
    });
    const normalCheckbox = screen.getByLabelText('Normal checkbox (valgfritt)') as HTMLInputElement;
    expect(normalCheckbox).toBeInTheDocument();
    expect(normalCheckbox.checked).toBe(false);

    await userEvent.click(normalCheckbox);
    expect(normalCheckbox.checked).toBe(true);

    await userEvent.click(normalCheckbox);
    expect(normalCheckbox.checked).toBe(false);
  });
});
