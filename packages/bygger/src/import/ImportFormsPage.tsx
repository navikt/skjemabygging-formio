import { Skeleton, Table, UNSAFE_Combobox } from '@navikt/ds-react';
import { ComboboxOption } from '@navikt/ds-react/esm/form/combobox/types';
import { ButtonWithSpinner, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import RowLayout from '../components/layout/RowLayout';
import Title from '../components/layout/Title';
import TitleRowLayout from '../components/layout/TitleRowLayout';
import { formMatches, mapToOption } from './ImportFormsPage.utils';
import api from './api';

export const useStyles = makeStyles({
  submitButton: {
    marginTop: 'var(--ax-space-16)',
  },
});

type Result = Pick<Form, 'path' | 'title' | 'skjemanummer'> & {
  status: 'ok' | 'feilet';
};

const ImportFormsPage = () => {
  const styles = useStyles();
  const [forms, setForms] = useState<Form[]>([]);
  const [formsErrorMessage, setFormsErrorMessage] = useState<string | undefined>(undefined);
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<ComboboxOption[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<ComboboxOption[]>([]);

  useEffect(() => {
    api
      .getFormsInProduction()
      .then((forms) => setForms(forms))
      .catch((_err) => setFormsErrorMessage('Feil ved henting av skjema fra produksjon'));
  }, []);

  const mappedOptions = useMemo(() => forms.map(mapToOption), [forms]);

  useEffect(() => {
    setOptions(mappedOptions);
    setFilteredOptions(mappedOptions);
  }, [mappedOptions]);

  const filterOptions = useCallback(
    (searchTerm: string | undefined) => {
      if (searchTerm?.trim()) {
        setFilteredOptions(forms.filter(formMatches(searchTerm)).map(mapToOption));
      } else {
        setFilteredOptions(forms.map(mapToOption));
      }
    },
    [forms],
  );

  const overwriteForms = useCallback(
    async (formPaths: string[]) => {
      setResults([]);
      const results = await Promise.all(
        formPaths.map((path) =>
          api
            .overwriteForm(path)
            .then((form) => {
              return { path, title: form.title, skjemanummer: form.skjemanummer, status: 'ok' } as Result;
            })
            .catch((_err) => {
              const form = forms.find((f) => f.path === path);
              return {
                path,
                title: form?.title ?? '?',
                skjemanummer: form?.skjemanummer ?? '?',
                status: 'feilet',
              } as Result;
            }),
        ),
      );
      setResults(results);
    },
    [forms],
  );

  const toggleSelected = useCallback(
    (value: string, isSelected: boolean) => {
      const option = options.find((o) => o.value === value);
      const selectedOption = selectedOptions.find((o) => o.value === value);
      if (option) {
        if (isSelected && !selectedOption) {
          setSelectedOptions([...selectedOptions, option]);
        } else if (!isSelected && selectedOption) {
          setSelectedOptions(selectedOptions.filter((o) => o.value !== value));
        }
      }
    },
    [options, selectedOptions],
  );

  const renderCombobox = () => {
    return (
      <UNSAFE_Combobox
        filteredOptions={filteredOptions}
        options={options}
        selectedOptions={selectedOptions}
        label="Søk etter skjema:"
        isMultiSelect
        onChange={(value: string) => {
          filterOptions(value);
        }}
        onToggleSelected={toggleSelected}
        error={formsErrorMessage}
      />
    );
  };

  const renderSummary = () => {
    if (!results.length) {
      return null;
    }
    return (
      <Table zebraStripes title="Resultat">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Skjemanummer</Table.HeaderCell>
            <Table.HeaderCell>Tittel</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {results.map((result) => (
            <Table.Row key={result.path}>
              <Table.DataCell>{result.skjemanummer}</Table.DataCell>
              <Table.DataCell>{result.title}</Table.DataCell>
              <Table.DataCell>{result.status}</Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  };

  return (
    <AppLayout>
      <TitleRowLayout>
        <Title>Importer skjema fra produksjon</Title>
      </TitleRowLayout>

      <RowLayout>
        {!options.length && !formsErrorMessage ? <Skeleton width="100%" height={80} /> : renderCombobox()}
        <ButtonWithSpinner
          className={styles.submitButton}
          onClick={() => overwriteForms(selectedOptions.map((o) => o.value))}
        >
          Importer
        </ButtonWithSpinner>
        {renderSummary()}
      </RowLayout>
    </AppLayout>
  );
};

export default ImportFormsPage;
