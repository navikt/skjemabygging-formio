import { BodyShort, Heading } from '@navikt/ds-react';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../../context/languages';
import makeStyles from '../../../util/styles/jss/jss';

export interface Props {
  form: NavFormType;
  className?: string;
}
const useStyles = makeStyles({
  maxContentWidth: {
    maxWidth: '960px',
    margin: '0 auto',
  },
  titleHeader: {
    padding: '1.5rem 0',
    borderBottom: '4px solid #99c4dd',
  },
  formNumber: {
    color: '#4F4F4F',
    margin: '0.5rem 0 0 0',
    fontSize: '0.875rem',
  },
  '@media screen and (max-width: 992px)': {
    titleHeader: {
      padding: '1rem',
    },
  },
});

export function FormTitle({ form }: Props) {
  const { translate } = useLanguages();
  const styles = useStyles();

  return (
    <header className={styles.titleHeader}>
      <div className={styles.maxContentWidth}>
        <Heading level="1" size="xlarge">
          {translate(form.title)}
        </Heading>
        {form.properties && form.properties.skjemanummer && <BodyShort>{form.properties.skjemanummer}</BodyShort>}
      </div>
    </header>
  );
}
