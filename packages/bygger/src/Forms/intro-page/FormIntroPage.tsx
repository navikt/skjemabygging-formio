import { Heading } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import { useForm } from '../../context/old_form/FormContext';
import EditFormSidebar from '../edit/EditFormSidebar';
import { EnableIntroPageSwitch } from './components/EnableIntroPageSwitch';
import { AutomaticProcessing } from './sections/AutomaticProcessing';
import { DataDisclosure } from './sections/DataDisclosure';
import { DataStorage } from './sections/DataStorage';
import { DataTreatment } from './sections/DataTreatment';
import { ImportantInformation } from './sections/ImportantInformation';
import { Introduction } from './sections/Introduction';
import { OptionalElement } from './sections/OptionalElement';
import { OutOfScope } from './sections/OutOfScope';
import { Prerequisites } from './sections/Prerequisites';
import { Scope } from './sections/Scope';
import { SectionsChecboxes } from './sections/SectionsChecboxes';
import { SelfDeclaration } from './sections/SelfDeclaration';

export default function FormIntroPage({ form }: { form: Form }) {
  const { changeForm } = useForm();

  console.log(form);

  const { sections, enabled, importantInformation } = form.introPage ?? {
    enabled: false,
    introduction: '',
    sections: {},
    selfDeclaration: '',
  };
  const { scope, outOfScope, dataDisclosure, optional, automaticProcessing } = sections ?? {};

  const {
    path,
    title,
    properties: { skjemanummer },
    lock,
  } = form;
  const isLockedForm = !!lock;

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

        <EnableIntroPageSwitch form={form} onChange={changeForm} />

        {enabled && (
          <>
            <SectionsChecboxes form={form} onChange={changeForm} />
            <Introduction form={form} handleChange={changeForm} />
            {importantInformation && <ImportantInformation form={form} handleChange={changeForm} />}
            {scope && <Scope form={form} handleChange={changeForm} />}
            {outOfScope && <OutOfScope form={form} handleChange={changeForm} />}
            <Prerequisites form={form} handleChange={changeForm} />
            {dataDisclosure && <DataDisclosure form={form} handleChange={changeForm} />}
            <DataTreatment form={form} handleChange={changeForm} />
            <DataStorage />
            {automaticProcessing && <AutomaticProcessing form={form} handleChange={changeForm} />}
            {optional && <OptionalElement form={form} handleChange={changeForm} />}
            <SelfDeclaration form={form} handleChange={changeForm} />
          </>
        )}
      </RowLayout>
    </AppLayout>
  );
}
