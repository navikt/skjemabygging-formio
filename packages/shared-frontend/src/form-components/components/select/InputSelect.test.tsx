import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { LanguageProvider } from '../../../context/language/LanguageContext';
import { SubmissionProvider, useSubmission } from '../../../context/submission/SubmissionContext';
import { ValidationProvider } from '../../../context/validation/ValidationContext';
import InputSelect from './InputSelect';

const values: ComponentValue[] = [
  { value: 'no', label: 'Norway' },
  { value: 'se', label: 'Sweden' },
];

const renderWithProviders = (children: ReactNode, initialValue?: string) => {
  return render(
    <LanguageProvider translate={(text) => text ?? ''} currentLanguage="nb">
      <SubmissionProvider initialSubmission={{ data: initialValue ? { country: initialValue } : {} }}>
        <ValidationProvider>{children}</ValidationProvider>
      </SubmissionProvider>
    </LanguageProvider>,
  );
};

const SubmissionValue = () => {
  const { submission } = useSubmission();
  return <span>{String(submission?.data.country ?? '')}</span>;
};

describe('InputSelect', () => {
  it('renders an Aksel combobox with the selected label', () => {
    renderWithProviders(<InputSelect submissionPath="country" label="Country" values={values} />, 'no');

    expect(screen.getByRole('combobox', { name: 'Country' })).toBeDefined();
    expect(screen.getAllByText('Norway').length).toBe(2);
  });

  it('updates submission when a value is selected', () => {
    renderWithProviders(
      <>
        <InputSelect submissionPath="country" label="Country" values={values} />
        <SubmissionValue />
      </>,
    );

    fireEvent.pointerUp(screen.getByRole('option', { name: 'Sweden' }));

    expect(screen.getByText('se')).toBeDefined();
  });
});
