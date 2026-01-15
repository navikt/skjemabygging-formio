import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons';
import classNames from 'classnames';
import makeStyles from '../../../util/styles/jss/jss';
import InnerHtmlLong from '../../inner-html/InnerHtmlLong';

const useStyles = makeStyles({
  container: {
    margin: 'var(--ax-space-8) 0',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    flex: 'none',
    marginRight: '4px',
    '&:is(svg) path': {
      fill: 'var(--ax-text-danger-decoration)',
    },
  },
  text: {
    color: 'var(--ax-text-danger-subtle)',
  },
});

interface Props {
  children?: string;
}

/**
 * This error is similar to the validations errors in form
 * but can be used stand alone other places in a form like after a button.
 */
const StandaloneValidationError = ({ children }: Props) => {
  const styles = useStyles();

  if (!children) {
    return null;
  }

  return (
    <div className={styles.container}>
      <ExclamationmarkTriangleFillIcon aria-hidden fontSize="1rem" className={styles.icon} />
      <InnerHtmlLong content={children} className={classNames(styles.text, 'aksel-label')} />
    </div>
  );
};

export default StandaloneValidationError;
