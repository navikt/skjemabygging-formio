import { Enhet, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { fetchFilteredEnhetsliste } from '../../../../api/enhetsliste/fetchEnhetsliste';
import { useAppConfig } from '../../../../context/config/configContext';
import { useForm } from '../../../../context/form/FormContext';
import FormSelect from './FormSelect';

interface Props {
  submissionPath: string;
}

const FormNavUnitSelector = ({ submissionPath }: Props) => {
  const { baseUrl } = useAppConfig();
  const { form } = useForm();
  const { enhetstyper } = form.properties;
  const [list, setList] = useState<Enhet[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const filteredList = await fetchFilteredEnhetsliste(baseUrl, enhetstyper ?? []);
        setList(filteredList);
      } catch (_) {
        setError(TEXTS.statiske.navUnit.fetchError);
      }
    };

    fetchData();
  }, [baseUrl, enhetstyper]);

  return (
    <FormSelect
      submissionPath={submissionPath}
      label={TEXTS.statiske.navUnit.choose}
      values={list?.map(({ navn, enhetNr }) => {
        return {
          value: enhetNr,
          label: navn,
        };
      })}
      selectText={TEXTS.statiske.navUnit.selectDefault}
      error={error}
    />
  );
};

export default FormNavUnitSelector;
