import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { checkboxDeprecatedForm } from '../../../../../../../mocks/mocks/data/forms-api/checkbox/checkboxDeprecatedForm';
import { renderNavForm, setupNavFormio } from '../../../../../test/navform-render';

const form = checkboxDeprecatedForm();

describe('NavCheckbox', () => {
  beforeAll(setupNavFormio);

  it('should update checked value', async () => {
    await renderNavForm({
      form,
    });
    const normalCheckbox = screen.getByRole('checkbox', { name: 'Normal checkbox' }) as HTMLInputElement;
    expect(normalCheckbox).toBeInTheDocument();
    expect(normalCheckbox.checked).toBe(false);

    await userEvent.click(normalCheckbox);
    expect(normalCheckbox.checked).toBe(true);

    await userEvent.click(normalCheckbox);
    expect(normalCheckbox.checked).toBe(false);
  });
});
