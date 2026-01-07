import { Heading, Tag } from '@navikt/ds-react';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import classNames from 'classnames';
import { useLanguages } from '../../../context/languages';
import makeStyles from '../../../util/styles/jss/jss';
import FormIcon from './FormIcon';

export interface Props {
  form: NavFormType;
  title?: string;
  hideIconOnMobile?: boolean;
}

const useStyles = makeStyles({
  titleHeader: {
    marginBottom: 'var(--ax-space-40)',
  },
  normalFontWeight: {
    fontWeight: 'normal',
  },
  titleIcon: {
    position: 'relative',
    left: 0,
    top: 0,
  },
  titleIconHidden: {
    '@media screen and (max-width: 1280px)': {
      display: 'none',
    },
  },
  titleIconSvg: {
    position: 'absolute',
    left: '-100px',
    top: '7px',
    '@media screen and (max-width: 1280px)': {
      position: 'static',
      marginBottom: 'var(--ax-space-8)',
    },
  },
});

export function FormTitle({ form, title, hideIconOnMobile }: Props) {
  const { translate } = useLanguages();
  const styles = useStyles();
  const header = title ?? form.title;

  return (
    <header className={styles.titleHeader}>
      <div className={classNames(styles.titleIcon, { [styles.titleIconHidden]: hideIconOnMobile })}>
        <FormIcon className={styles.titleIconSvg} />
      </div>
      {title && (
        <Heading level="1" size="xsmall" textColor="subtle" className={styles.normalFontWeight}>
          {translate(form.title)}
        </Heading>
      )}
      <Heading level={title ? '2' : '1'} size="xlarge" id="page-title" tabIndex={-1}>
        {translate(header)}
      </Heading>
      {form.properties && form.properties.skjemanummer && (
        <Tag variant="neutral-moderate" size="small">
          {form.properties.skjemanummer}
        </Tag>
      )}
    </header>
  );
}
