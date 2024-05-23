import { Heading } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { AppLayout } from '../components/AppLayout';
import Column from '../components/layout/Column';
import Row from '../components/layout/Row';
import MottaksadresserListe from './MottaksadresserListe';

const useStyles = makeStyles({
  centerColumn: {
    gridColumn: '2 / 3',
  },
});

const MottaksadresserPage = () => {
  const styles = useStyles();
  return (
    <AppLayout>
      <Row>
        <Column className={styles.centerColumn}>
          <Heading level="1" size="xlarge">
            Mottaksadresser
          </Heading>
        </Column>
      </Row>
      <Row>
        <MottaksadresserListe />
      </Row>
    </AppLayout>
  );
};

export default MottaksadresserPage;
