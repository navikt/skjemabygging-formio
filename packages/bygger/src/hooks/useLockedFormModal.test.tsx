import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { fireEvent, render, screen } from '@testing-library/react';
import LockedFormModal from '../Forms/lockedFormModal/LockedFormModal';
import useLockedFormModal from './useLockedFormModal';

const TestComponent = () => {
  const { openLockedFormModal, isLockedFormModalOpen, closeLockedFormModal } = useLockedFormModal();
  return (
    <div>
      <button onClick={openLockedFormModal}>Open Modal</button>
      <LockedFormModal
        open={isLockedFormModalOpen}
        onClose={closeLockedFormModal}
        form={
          {
            properties: { lockedFormReason: 'En god grunn' },
          } as NavFormType
        }
      />
    </div>
  );
};

describe('useLockedFormModal', () => {
  test('modal is initially closed', () => {
    render(<TestComponent />);
    expect(screen.queryByText('Skjemaet er låst for redigering')).not.toBeVisible();
  });

  test('modal opens when openLockedFormModal is called', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByText('Open Modal'));

    expect(screen.getByText('Skjemaet er låst for redigering')).toBeVisible();
    expect(screen.getByText('En god grunn')).toBeVisible();
  });

  test('modal closes when close button is clicked', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByText('Open Modal'));
    fireEvent.click(screen.getByTitle('Lukk'));

    expect(screen.queryByText('Skjemaet er låst for redigering')).not.toBeVisible();
  });
});
