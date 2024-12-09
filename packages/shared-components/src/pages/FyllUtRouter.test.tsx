import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { setupNavFormio } from '../../test/navform-render';
import { form, translationsForNavForm } from '../../test/test-data/form/skjema-med-oversettelser';
import { AppConfigProvider } from '../context/config/configContext';
import { getPanelSlug } from '../util/form/form';
import FyllUtRouter from './FyllUtRouter';

const mockFormPath = `/${form.path}`;
const firstPanelSlug = getPanelSlug(form, 0);
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<object>('react-router-dom');
  return {
    ...actual,
    useResolvedPath: () => ({
      pathname: mockFormPath,
    }),
  };
});

describe('FyllUtRouter', () => {
  beforeAll(setupNavFormio);

  const renderFyllUtRouter = ({ form, translationsForNavForm }, appConfigProps) => {
    const config = {
      featureToggles: {},
      ...appConfigProps,
    };

    const router = createMemoryRouter(
      [
        {
          path: `${mockFormPath}/*`,
          element: <FyllUtRouter form={form} translations={translationsForNavForm} />,
        },
      ],
      {
        initialEntries: [`${mockFormPath}/${firstPanelSlug}`],
      },
    );

    render(
      <AppConfigProvider {...config}>
        <RouterProvider router={router} />
      </AppConfigProvider>,
    );
  };

  describe('Submission method', () => {
    it('Renders vedleggspanel when submission method is undefined', () => {
      renderFyllUtRouter({ form, translationsForNavForm }, { submissionMethod: undefined });
      expect(screen.queryByRole('heading', { name: form.title })).toBeInTheDocument();
      const stepperToggle = screen.queryByRole('button', { name: 'Steg 1 av 2' });
      if (stepperToggle) {
        stepperToggle.click();
      }
      expect(screen.queryByRole('link', { name: 'Vedleggsliste' })).toBeInTheDocument();
    });

    it('Renders vedleggspanel when submission method is paper', () => {
      renderFyllUtRouter({ form, translationsForNavForm }, { submissionMethod: 'paper' });
      expect(screen.queryByRole('heading', { name: form.title })).toBeInTheDocument();
      const stepperToggle = screen.queryByRole('button', { name: 'Steg 1 av 2' });
      if (stepperToggle) {
        stepperToggle.click();
      }
      expect(screen.queryByRole('link', { name: 'Vedleggsliste' })).toBeInTheDocument();
    });

    it('Does not render vedleggspanel when submission method is digital', () => {
      renderFyllUtRouter({ form, translationsForNavForm }, { submissionMethod: 'digital' });
      expect(screen.queryByRole('heading', { name: form.title })).toBeInTheDocument();
      const stepperToggle = screen.queryByRole('button', { name: 'Steg 1 av 1' });
      if (stepperToggle) {
        stepperToggle.click();
      }
      expect(screen.queryByRole('link', { name: 'Veiledning' })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Vedleggsliste' })).not.toBeInTheDocument();
    });
  });
});
