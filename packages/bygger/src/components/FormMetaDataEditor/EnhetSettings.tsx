import { Checkbox, Label, Panel } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { Enhetstype, supportedEnhetstyper } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';

interface EnhetSettingsProps {
  enhetMaVelges: boolean;
  selectedEnhetstyper?: Enhetstype[];
  onChangeEnhetMaVelges: (value: boolean) => void;
  onChangeEnhetstyper: (enhetstyper: Enhetstype[]) => void;
}

const useStyles = makeStyles({
  list: {
    maxWidth: '100%',
    maxHeight: '200px',
    display: 'flex',
    gap: '0 1rem',
    flexDirection: 'column',
    flexWrap: 'wrap',
    listStyle: 'none',

    '@media screen and (max-width: 1080px)': {
      maxHeight: '400px',
    },
    '@media screen and (max-width: 600px)': {
      maxHeight: '1000px',
    },
  },
});

const EnhetSettings = ({
  enhetMaVelges,
  selectedEnhetstyper,
  onChangeEnhetMaVelges,
  onChangeEnhetstyper,
}: EnhetSettingsProps) => {
  const styles = useStyles();

  useEffect(() => {
    if (enhetMaVelges && selectedEnhetstyper === undefined) {
      onChangeEnhetstyper(supportedEnhetstyper);
    }
  }, [onChangeEnhetstyper, enhetMaVelges, selectedEnhetstyper]);

  return (
    <>
      <Checkbox checked={enhetMaVelges} onChange={(event) => onChangeEnhetMaVelges(event.target.checked)}>
        {'Bruker må velge enhet ved innsending på papir'}
      </Checkbox>
      {enhetMaVelges && selectedEnhetstyper && (
        <Panel className="mb-4">
          <Label>Enhetstyper</Label>
          <ul className={styles.list}>
            {supportedEnhetstyper.map((enhetsType: Enhetstype) => (
              <li key={enhetsType}>
                <Checkbox
                  checked={selectedEnhetstyper.includes(enhetsType)}
                  onChange={(event) => {
                    const updatedSelectedEnhetstyper = event.target.checked
                      ? [...selectedEnhetstyper, enhetsType]
                      : selectedEnhetstyper.filter((selected) => selected !== enhetsType);
                    onChangeEnhetstyper(updatedSelectedEnhetstyper);
                  }}
                >
                  {enhetsType}
                </Checkbox>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
};

export default EnhetSettings;
