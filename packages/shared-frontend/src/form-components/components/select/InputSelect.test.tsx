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

const renderWithProviders = (children: ReactNode, initialValue?: string) => {
  return render(
    <LanguageProvider translate={(text) => text ?? ''} currentLanguage="nb">
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
  return <span>{String(submission?.data.country ?? '')}</span>;
};

describe('InputSelect', () => {
  it('renders an Aksel combobox with the selected label', () => {
    renderWithProviders(<Select statePath="country" label="Country" values={values} />, 'no');

    expect(screen.getByRole('combobox', { name: 'Country' })).toBeDefined();
    expect(screen.getAllByText('Norway').length).toBe(2);
  });

  it('updates submission when a value is selected', () => {
    renderWithProviders(
      <>
        <Select statePath="country" label="Country" values={values} />
        <SubmissionValue />
      </>,
    );

    fireEvent.pointerUp(screen.getByRole('option', { name: 'Sweden' }));

    expect(screen.getByText('se')).toBeDefined();
  });
});
