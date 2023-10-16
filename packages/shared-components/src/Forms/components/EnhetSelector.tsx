import { Enhet, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import ReactSelect from 'react-select';
import { useLanguages } from '../../context/languages';
import makeStyles from '../../util/jss';
import { navCssVariables } from '../../util/navCssVariables';

const useStyles = makeStyles({
  enhetsliste: {
    maxWidth: '20rem',
  },
});

const EnhetSelector = ({ enhetsliste = [], onSelectEnhet, error }: EnhetSelectorProps) => {
  const { translate } = useLanguages();
  const styles = useStyles();
  const reactSelectCustomStyles = {
    control: (base) => ({
      ...base,
      ...(error ? { borderColor: navCssVariables.navError, boxShadow: `0 0 0 1px ${navCssVariables.navError}` } : {}),
    }),
  };

  if (enhetsliste.length === 0) {
    return <></>;
  }

  const options = enhetsliste.map((enhet) => ({ label: enhet.navn, value: enhet.enhetNr }));
  return (
    <div className="mb-4">
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
        <div id="enhetSelectError">
          <p className="typo-feilmelding">{error}</p>
        </div>
      )}
    </div>
  );
};

interface EnhetSelectorProps {
  enhetsliste: Enhet[];
  onSelectEnhet: (enhetNummer: string | null) => void;
  error?: string;
}

export default EnhetSelector;
