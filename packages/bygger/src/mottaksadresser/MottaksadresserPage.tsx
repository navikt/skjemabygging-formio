import { makeStyles } from "@material-ui/styles";
import { Heading } from "@navikt/ds-react";
import { AppLayout } from "../components/AppLayout";
import Column from "../components/layout/Column";
import Row from "../components/layout/Row";
import MottaksadresserListe from "./MottaksadresserListe";

const useStyles = makeStyles({
  centerColumn: {
    gridColumn: "2 / 3",
  },
});

const MottaksadresserPage = () => {
  const styles = useStyles();
  return (
    <AppLayout
      navBarProps={{
        visOversettelseliste: false,
        visSkjemaliste: true,
      }}
    >
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
