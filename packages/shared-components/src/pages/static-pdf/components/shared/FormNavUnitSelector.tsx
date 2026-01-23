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

  useEffect(() => {
    const fetchData = async () => {
      const filteredList = await fetchFilteredEnhetsliste(baseUrl, enhetstyper ?? []);
      setList(filteredList);
    };
    fetchData();
  }, [baseUrl, enhetstyper]);

  if (list.length === 0) {
    return <></>;
  }

  return (
    <FormSelect
      submissionPath={submissionPath}
      label={TEXTS.statiske.prepareLetterPage.chooseEntity}
      values={list?.map(({ navn, enhetNr }) => {
        return {
          value: enhetNr,
          label: navn,
        };
      })}
      validators={{
        required: true,
      }}
      selectText={TEXTS.statiske.prepareLetterPage.selectEntityDefault}
    />
  );
};

export default FormNavUnitSelector;
