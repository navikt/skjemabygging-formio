import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import React from 'react';
import RowLayout from './RowLayout';

export interface Props {
  children: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

const useStyles = makeStyles({
  fixedPosition: {
    position: 'sticky',
    top: '5.5rem',
    left: 0,
    right: 0,
    height: '4.5rem',
    backgroundColor: 'var(--ax-bg-default)',
    zIndex: '10000',
  },
});

/**
 * @param children Usually this will be <Title><Title>
 * @param left
 * @param right
 * @constructor
 */
const TitleRowLayout = ({ children, left, right }: Props) => {
  const styles = useStyles();

  return (
    <div className={styles.fixedPosition}>
      <RowLayout left={left} right={right} overflowHidden={true}>
        {children}
      </RowLayout>
    </div>
  );
};

export default TitleRowLayout;
