import { Heading, Skeleton, Table, UNSAFE_Combobox } from '@navikt/ds-react';
import { ComboboxOption } from '@navikt/ds-react/esm/form/combobox/types';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import ButtonWithSpinner from '../components/ButtonWithSpinner';
import Row from '../components/layout/Row';
import { formMatches, mapToOption } from './ImportFormsPage.utils';
import api from './api';
import { useStyles } from './styles';

type Result = Pick<NavFormType, 'path' | 'title'> & {
  skjemanummer: string;
  status: 'ok' | 'feilet';
};

const ImportFormsPage = () => {
  const styles = useStyles();
  const [forms, setForms] = useState<NavFormType[]>([]);
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

  useEffect(() => {
    const opts = forms.map(mapToOption);
    setOptions(opts);
    setFilteredOptions(opts);
  }, [forms]);

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
              return { path, title: form.title, skjemanummer: form.properties.skjemanummer, status: 'ok' } as Result;
            })
            .catch((_err) => {
              const form = forms.find((f) => f.path === path);
              return {
                path,
                title: form?.title ?? '?',
                skjemanummer: form?.properties.skjemanummer ?? '?',
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
        onChange={(event) => filterOptions(event?.target.value as string)}
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
    <AppLayout navBarProps={{}}>
      <Row className={styles.titleRow}>
        <Heading size="large" level="1">
          Importer skjema fra produksjon
        </Heading>
      </Row>
      <Row className={styles.main}>
        {!options.length && !formsErrorMessage ? <Skeleton width="100%" height={80} /> : renderCombobox()}
        <ButtonWithSpinner
          className={styles.submitButton}
          onClick={() => overwriteForms(selectedOptions.map((o) => o.value))}
        >
          Importer
        </ButtonWithSpinner>
        {renderSummary()}
      </Row>
    </AppLayout>
  );
};

export default ImportFormsPage;
