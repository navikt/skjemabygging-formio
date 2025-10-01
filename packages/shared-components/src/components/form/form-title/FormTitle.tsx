import { Heading, Tag } from '@navikt/ds-react';
import { NavFormType, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import classNames from 'classnames';
import { useParams } from 'react-router';
import { useLanguages } from '../../../context/languages';
import makeStyles from '../../../util/styles/jss/jss';
import FormIcon from './FormIcon';

export interface Props {
  form: NavFormType;
  hideIconOnMobile?: boolean;
}

const useStyles = makeStyles({
  subtleFormTitle: {
    color: 'var(--a-text-subtle)',
    minHeight: '3rem',
    alignContent: 'end',
  },
  titleHeader: {
    marginBottom: 'var(--a-spacing-10)',
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
      marginBottom: 'var(--a-spacing-2)',
    },
  },
});

export function FormTitle({ form, hideIconOnMobile }: Props) {
  const { translate } = useLanguages();
  const params = useParams();
  const styles = useStyles();

  const pathIsUploadId = params['*'] === 'legitimasjon';
  const header = pathIsUploadId ? TEXTS.statiske.uploadId.title : form.title;

  return (
    <header className={styles.titleHeader}>
      <div className={styles.subtleFormTitle}>{pathIsUploadId && translate(form.title)}</div>
      <div className={classNames(styles.titleIcon, { [styles.titleIconHidden]: hideIconOnMobile })}>
        <FormIcon className={styles.titleIconSvg} />
      </div>
      <Heading level="1" size="xlarge">
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
