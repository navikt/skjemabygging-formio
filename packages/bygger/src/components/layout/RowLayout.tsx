import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import classNames from 'classnames';
import React from 'react';

export interface Props {
  children: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  fixedPosition?: boolean;
  fullWidth?: boolean;
}

const useStyles = makeStyles({
  sidePadding: {
    padding: '0 var(--a-spacing-4)',
  },
  fixed: {
    position: 'sticky',
    top: '5.5rem',
    left: 0,
    right: 0,
    overflow: 'hidden',
    height: '4.5rem',
    backgroundColor: 'var(--a-bg-default)',
    zIndex: '10000',
  },
});

const RowLayout = ({ children, left, right, fixedPosition, fullWidth }: Props) => {
  const styles = useStyles();

  return (
    <div className={classNames('row-layout', styles.sidePadding, { [styles.fixed]: fixedPosition })}>
      {(left || !fullWidth) && <div className="row-layout__left">{left}</div>}
      <div className="row-layout__main">{children}</div>
      {(right || !fullWidth) && <div className="row-layout__right">{right}</div>}
    </div>
  );
};

export default RowLayout;
