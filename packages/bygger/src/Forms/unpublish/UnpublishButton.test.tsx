import { dateUtils, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { fireEvent, render, screen } from '@testing-library/react';
import UnpublishButton from './UnpublishButton';

describe('UnpublishButton', () => {
  const onUnpublish = vi.fn();
  const renderButton = (form?: NavFormType) => {
    if (!form) {
      form = {
        properties: { published: dateUtils.getIso8601String() },
      } as NavFormType;
    }
    render(<UnpublishButton onUnpublish={onUnpublish} form={form} />);
  };

  it('do not render button if not published', () => {
    renderButton({ properties: {} } as NavFormType);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders button', async () => {
    renderButton();
    expect(await screen.findByRole('button')).toBeInTheDocument();
    expect(screen.queryByTitle('Skjemaet er låst')).not.toBeInTheDocument();
  });

  it('renders button with lock', async () => {
    renderButton({ properties: { published: dateUtils.getIso8601String(), isLockedForm: true } } as NavFormType);
    expect(await screen.findByRole('button')).toBeInTheDocument();
    expect(screen.getByTitle('Skjemaet er låst')).toBeInTheDocument();
  });

  it('click button', async () => {
    renderButton();
    const button = await screen.findByRole('button');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
