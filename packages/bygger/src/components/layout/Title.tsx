import { PadlockLockedIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, Heading } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import React from 'react';

export interface Props {
  children: React.ReactNode;
  subTitle?: React.ReactNode;
  lockedForm?: boolean;
}

const useStyles = makeStyles({
  padlockIcon: {
    position: 'relative',
    top: '0.4rem',
  },
});

const Title = ({ children, subTitle, lockedForm }: Props) => {
  const styles = useStyles();

  return (
    <Box>
      <Heading level="1" size={subTitle ? 'medium' : 'large'}>
        {children}
        {lockedForm && <PadlockLockedIcon title="Skjemaet er låst" className={styles.padlockIcon} />}
      </Heading>
      {subTitle && <BodyShort>{subTitle}</BodyShort>}
    </Box>
  );
};

export default Title;
