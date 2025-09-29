import { fireEvent, render, screen } from '@testing-library/react';
import Modal from './Modal';

const onClose = vi.fn();

describe('Modal', () => {
  beforeAll(() => {
    render(
      <Modal onClose={onClose} open={true} title="Test">
        Test
      </Modal>,
    );
  });

  it('renders modal and check that it work', async () => {
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: 'Lukk' }));
    expect(onClose).toHaveBeenCalled();
  });
});
