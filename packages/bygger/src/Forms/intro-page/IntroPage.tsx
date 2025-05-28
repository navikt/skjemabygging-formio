import { Heading, Switch } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import EditFormSidebar from '../edit/EditFormSidebar';
import { AutomaticProcessing } from './components/AutomaticProcessing';
import { DataDisclosure } from './components/DataDisclosure';
import { DataTreatment } from './components/DataTreatment';
import { ImportantInformation } from './components/ImportantInformation';
import { Information } from './components/Information';
import { Introduction } from './components/Introduction';
import { OptionalElement } from './components/OptionalElement';
import { OutOfScope } from './components/OutOfScope';
import { Prerequisites } from './components/Prerequisites';
import { Scope } from './components/Scope';
import { SectionsChecboxes } from './components/SectionsChecboxes';
import { SelfDeclaration } from './components/SelfDeclaration';

const useStyles = makeStyles({
  enableSwitch: {
    margin: '0 0 2rem 0',
  },
});

export default function IntroPage({ form }: { form: Form }) {
  const {
    path,
    title,
    properties: { skjemanummer },
    lock,
  } = form;
  const isLockedForm = !!lock;

  const [checked, setChecked] = useState(true); // TODO sette false som default og hente ut verdi fra forms API
  const styles = useStyles();

  return (
    <AppLayout
      navBarProps={{
        formMenu: true,
        formPath: path,
      }}
    >
      <TitleRowLayout>
        <Title subTitle={skjemanummer} lockedForm={isLockedForm}>
          {title}
        </Title>
      </TitleRowLayout>

      <RowLayout right={<EditFormSidebar form={form} />}>
        <Heading level="2" size="large" spacing>
          Standard introside
        </Heading>
        <Switch
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          size="small"
          className={styles.enableSwitch}
        >
          Bruk standard introside
        </Switch>
        {checked && (
          <>
            <SectionsChecboxes />
            <Introduction />
            <ImportantInformation />
            <Scope />
            <OutOfScope />
            <Prerequisites />
            <DataDisclosure />
            <DataTreatment />
            <Information />
            <AutomaticProcessing />
            <OptionalElement />
            <SelfDeclaration />
          </>
        )}
      </RowLayout>
    </AppLayout>
  );
}
