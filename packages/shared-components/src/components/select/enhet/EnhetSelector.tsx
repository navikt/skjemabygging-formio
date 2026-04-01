import { BodyShort } from '@navikt/ds-react';
import { Enhet, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import ReactSelect from 'react-select';
import { useLanguages } from '../../../context/languages';
import makeStyles from '../../../util/styles/jss/jss';
import { navCssVariables } from '../../../util/styles/nav-css/navCssVariables';

const useStyles = makeStyles({
  enhetsliste: {
    width: '100%',
    maxWidth: '350px',
  },
});

const EnhetSelector = ({ enhetsliste = [], onSelectEnhet, error, description }: EnhetSelectorProps) => {
  const { translate } = useLanguages();
  const styles = useStyles();
  const selectId = 'enhetSelect';
  const descriptionId = 'enhetSelectDescription';
  const errorId = 'enhetSelectError';
  const describedBy = [description ? descriptionId : undefined, error ? errorId : undefined].filter(Boolean).join(' ');
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
    <div className="mb-4 aksel-form-field">
      <label htmlFor={selectId} className="aksel-label">
        {translate(TEXTS.statiske.prepareLetterPage.chooseEntity)}
      </label>
      {description && (
        <BodyShort id={descriptionId} as="div" className="aksel-form-field__description">
          {description}
        </BodyShort>
      )}
      <ReactSelect
        inputId={selectId}
        instanceId={selectId}
        className={styles.enhetsliste}
        options={options}
        styles={reactSelectCustomStyles}
        placeholder={translate(TEXTS.statiske.prepareLetterPage.selectEntityDefault)}
        aria-describedby={describedBy || undefined}
        onChange={(event) => {
          onSelectEnhet(event && event.value);
        }}
      />
      {error && (
        <p id={errorId} className="aksel-error-message aksel-label">
          {error}
        </p>
      )}
    </div>
  );
};

interface EnhetSelectorProps {
  enhetsliste: Enhet[];
  onSelectEnhet: (enhetNummer: string | null) => void;
  error?: string;
  description?: string;
}

export default EnhetSelector;
