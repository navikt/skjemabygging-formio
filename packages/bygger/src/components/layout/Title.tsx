import { PadlockLockedIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, Heading } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import React from 'react';

export interface Props {
  children: React.ReactNode;
  subTitle?: React.ReactNode;
  lockedForm?: boolean;
}

const useStyles = makeStyles({
  padlockIcon: {
    position: 'relative',
    top: '0.25rem',
  },
  heading: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
});

const Title = ({ children, subTitle, lockedForm }: Props) => {
  const styles = useStyles();

  return (
    <Box>
      <Heading level="1" size={subTitle ? 'medium' : 'large'} className={styles.heading}>
        {children}
        {lockedForm && <PadlockLockedIcon title={TEXTS.grensesnitt.lockedForm} className={styles.padlockIcon} />}
      </Heading>
      {subTitle && <BodyShort>{subTitle}</BodyShort>}
    </Box>
  );
};

export default Title;
