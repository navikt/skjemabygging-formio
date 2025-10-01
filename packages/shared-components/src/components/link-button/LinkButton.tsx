import { ButtonProps, Link, LinkProps } from '@navikt/ds-react';
import { Link as ReactRouterLink, LinkProps as ReactRouterLinkProps } from 'react-router';
import makeStyles from '../../util/styles/jss/jss';

const useStyles = makeStyles({
  primaryButtonVariant: {
    color: 'var(--a-white)',
    textDecoration: 'none',
  },
  otherButtonVariant: {
    textDecoration: 'none',
  },
});

type LinkButtonProps = { buttonVariant: ButtonProps['variant']; children?: React.ReactNode } & LinkProps &
  ReactRouterLinkProps;

const LinkButton = ({ buttonVariant = 'primary', children, ...rest }: LinkButtonProps) => {
  const styles = useStyles();

  const className = `navds-button navds-button--${buttonVariant} ${buttonVariant === 'primary' ? styles.primaryButtonVariant : styles.otherButtonVariant}`;

  return (
    <Link as={ReactRouterLink} {...rest} className={className}>
      {children}
    </Link>
  );
};

export default LinkButton;
