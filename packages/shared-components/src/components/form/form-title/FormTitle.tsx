import { Heading, Tag } from '@navikt/ds-react';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../../context/languages';
import makeStyles from '../../../util/styles/jss/jss';
import { FormContainer } from '../container/FormContainer';
import FormIcon from './FormIcon';

export interface Props {
  form: NavFormType;
  className?: string;
}

const useStyles = makeStyles({
  titleHeader: {},
  titleIcon: {
    position: 'relative',
    left: 0,
    top: 0,
  },
  titleIconSvg: {
    position: 'absolute',
    left: '-100px',
    top: '12px',
  },
});

export function FormTitle({ form }: Props) {
  const { translate } = useLanguages();
  const styles = useStyles();

  return (
    <header className={styles.titleHeader}>
      <FormContainer>
        <div className={styles.titleIcon}>
          <FormIcon title="a11y-title" className={styles.titleIconSvg} />
        </div>
        <Heading level="1" size="xlarge">
          {translate(form.title)}
        </Heading>
        {form.properties && form.properties.skjemanummer && (
          <Tag variant="neutral-moderate" size="small">
            {form.properties.skjemanummer}
          </Tag>
        )}
      </FormContainer>
    </header>
  );
}
