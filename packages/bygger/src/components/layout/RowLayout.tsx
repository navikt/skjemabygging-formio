import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import classNames from 'classnames';
import React from 'react';

export interface Props {
  children: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  fixedPosition?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const useStyles = makeStyles({
  sidePadding: {
    padding: '0 var(--a-spacing-4)',
  },
});

const RowLayout = ({ children, left, right, fullWidth, className }: Props) => {
  const styles = useStyles();

  return (
    <div className={classNames('row-layout', styles.sidePadding, className)}>
      {(left || !fullWidth) && <div className="row-layout__left">{left}</div>}
      <div className="row-layout__main">{children}</div>
      {(right || !fullWidth) && <div className="row-layout__right">{right}</div>}
    </div>
  );
};

export default RowLayout;
