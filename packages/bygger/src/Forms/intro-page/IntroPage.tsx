import { Heading, Switch } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import { SectionsChecboxes } from './components/SectionsChecboxes';

export default function IntroPage({ form }: { form: Form }) {
  const {
    path,
    title,
    properties: { skjemanummer },
    lock,
  } = form;
  const isLockedForm = !!lock;

  const [checked, setChecked] = useState(true); // TODO sette false som default og hente ut verdi fra forms API

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
      <RowLayout right={<p>Status og lagring kommer her</p>}>
        <Heading level="2" size="large" spacing>
          Standard introside
        </Heading>
        <Switch checked={checked} onChange={(e) => setChecked(e.target.checked)} size="small">
          Bruk standard introside
        </Switch>
        {checked && <SectionsChecboxes />}
      </RowLayout>
    </AppLayout>
  );
}
