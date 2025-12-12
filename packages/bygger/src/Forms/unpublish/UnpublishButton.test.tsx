import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { fireEvent, render, screen } from '@testing-library/react';
import UnpublishButton from './UnpublishButton';

describe('UnpublishButton', () => {
  const renderButton = (form?: Form) => {
    if (!form) {
      form = {
        status: 'published',
      } as Form;
    }
    render(<UnpublishButton form={form} />);
  };

  it('is not rendered if form is not published', () => {
    renderButton({ status: 'draft' } as Form);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('is rendered when form is published', async () => {
    renderButton({ status: 'published' } as Form);
    expect(await screen.findByRole('button')).toBeInTheDocument();
    expect(screen.queryByTitle('Skjemaet er låst')).not.toBeInTheDocument();
  });

  it('is rendered when form status is pending', async () => {
    renderButton({ status: 'pending' } as Form);
    expect(await screen.findByRole('button')).toBeInTheDocument();
  });

  it('is rendered with lock when form is locked', async () => {
    renderButton({ status: 'published', lock: { reason: 'Derfor' } } as Form);
    expect(await screen.findByRole('button')).toBeInTheDocument();
    expect(screen.getByTitle('Skjemaet er låst')).toBeInTheDocument();
  });

  it('opens modal on click', async () => {
    renderButton({ status: 'published' } as Form);
    const button = await screen.findByRole('button');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
