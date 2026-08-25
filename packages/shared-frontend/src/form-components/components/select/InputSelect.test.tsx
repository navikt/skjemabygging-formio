import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import Select from '../../../components/select/Select';
import { LanguageProvider } from '../../../context/language/LanguageContext';
import { SubmissionStateProvider, useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { ValidationProvider } from '../../../context/validation/ValidationContext';
import { ValidationScopeProvider } from '../../../context/validation/ValidationScopeContext';

const values: ComponentValue[] = [
  { value: 'no', label: 'Norway' },
  { value: 'se', label: 'Sweden' },
];
const pageKey = 'page1';

const renderWithProviders = (children: ReactNode, initialValue?: string | ComponentValue) => {
  return render(
    <LanguageProvider translate={(text) => text ?? ''} currentLanguage="nb" availableLanguages={['nb']}>
      <SubmissionStateProvider initialSubmission={{ data: initialValue ? { country: initialValue } : {} }}>
        <ValidationProvider>
          <ValidationScopeProvider pageKey={pageKey} components={[]}>
            {children}
          </ValidationScopeProvider>
        </ValidationProvider>
      </SubmissionStateProvider>
    </LanguageProvider>,
  );
};

const SubmissionValue = () => {
  const { submission } = useSubmissionState();
  return <span>{JSON.stringify(submission?.data.country ?? '')}</span>;
};

describe('InputSelect', () => {
  it('renders a native select with the selected value below the combobox threshold', () => {
    renderWithProviders(<Select statePath="country" label="Country" values={values} />, 'no');

    expect((screen.getByRole('combobox', { name: 'Country' }) as HTMLSelectElement).value).toBe('no');
  });

  it('updates submission with the selected string value by default', () => {
    renderWithProviders(
      <>
        <Select statePath="country" label="Country" values={values} />
        <SubmissionValue />
      </>,
    );

    fireEvent.change(screen.getByRole('combobox', { name: 'Country' }), { target: { value: 'se' } });

    expect(screen.getByText('"se"')).toBeDefined();
  });

  it('stores the selected ComponentValue when valueType is option', () => {
    renderWithProviders(
      <>
        <Select statePath="country" label="Country" values={values} valueType="option" />
        <SubmissionValue />
      </>,
      { value: 'no', label: 'Norway' },
    );

    fireEvent.change(screen.getByRole('combobox', { name: 'Country' }), { target: { value: 'se' } });

    expect(screen.getByText('{"value":"se","label":"Sweden"}')).toBeDefined();
  });
});
