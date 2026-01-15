import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import classNames from 'classnames';
import React from 'react';

export interface Props {
  children: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  fixedPosition?: boolean;
  fullWidth?: boolean;
  overflowHidden?: boolean;
  className?: string;
}

const useStyles = makeStyles({
  sidePadding: {
    padding: '0 var(--ax-space-16)',
  },
  overflowHidden: {
    overflow: 'hidden',
  },
});

const RowLayout = ({ children, left, right, fullWidth, overflowHidden, className }: Props) => {
  const styles = useStyles();

  return (
    <div className={classNames('row-layout', styles.sidePadding, className)}>
      {(left || !fullWidth) && <div className="row-layout__left">{left}</div>}
      <div className={classNames('row-layout__main', { [styles.overflowHidden]: overflowHidden }, className)}>
        {children}
      </div>
      {(right || !fullWidth) && <div className="row-layout__right">{right}</div>}
    </div>
  );
};

export default RowLayout;
