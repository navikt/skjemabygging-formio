import { Enhet, Enhetstype, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import ReactSelect from 'react-select';
import { fetchFilteredEnhetsliste } from '../../../api/enhetsliste/fetchEnhetsliste';
import { useAppConfig } from '../../../context/config/configContext';
import { useLanguages } from '../../../context/languages';
import makeStyles from '../../../util/styles/jss/jss';
import { navCssVariables } from '../../../util/styles/nav-css/navCssVariables';

const useStyles = makeStyles({
  enhetsliste: {
    width: '100%',
    maxWidth: '350px',
  },
});

const EnhetSelector = ({ enhetsliste = [], enhetstyper = [], onSelectEnhet, error }: EnhetSelectorProps) => {
  const { translate } = useLanguages();
  const { baseUrl } = useAppConfig();
  const styles = useStyles();
  const [list, setList] = useState<Enhet[]>(enhetsliste);
  const reactSelectCustomStyles = {
    control: (base) => ({
      ...base,
      ...(error ? { borderColor: navCssVariables.navError, boxShadow: `0 0 0 1px ${navCssVariables.navError}` } : {}),
    }),
  };

  useEffect(() => {
    const fetchData = async () => {
      const filteredList = await fetchFilteredEnhetsliste(baseUrl, enhetstyper);
      setList(filteredList);
    };
    if (enhetsliste?.length === 0 && list.length === 0 && baseUrl && enhetstyper) {
      fetchData();
    }
  }, [baseUrl, enhetsliste, enhetstyper, list]);

  if (list.length === 0) {
    return <></>;
  }

  const options = list.map((enhet) => ({ label: enhet.navn, value: enhet.enhetNr }));
  return (
    <div className="mb-4 navds-form-field">
      <label htmlFor="enhetSelect" className="navds-label">
        {translate(TEXTS.statiske.prepareLetterPage.chooseEntity)}
      </label>
      <ReactSelect
        id="enhetSelect"
        className={styles.enhetsliste}
        options={options}
        styles={reactSelectCustomStyles}
        placeholder={translate(TEXTS.statiske.prepareLetterPage.selectEntityDefault)}
        aria-describedby="enhetSelectError"
        onChange={(event) => {
          onSelectEnhet(event && event.value);
        }}
      />
      {error && (
        <p id="enhetSelectError" className="navds-error-message navds-label">
          {error}
        </p>
      )}
    </div>
  );
};

interface EnhetSelectorProps {
  enhetsliste?: Enhet[];
  enhetstyper?: Enhetstype[];
  onSelectEnhet: (enhetNummer: string | null) => void;
  error?: string;
}

export default EnhetSelector;
