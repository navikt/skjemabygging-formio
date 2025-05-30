import { Heading } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import { useForm } from '../../context/old_form/FormContext';
import EditFormSidebar from '../edit/EditFormSidebar';
import { EnableIntroPageSwitch } from './components/EnableIntroPageSwitch';
import { AutomaticProcessing } from './components/sections/AutomaticProcessing';
import { DataDisclosure } from './components/sections/DataDisclosure';
import { DataTreatment } from './components/sections/DataTreatment';
import { ImportantInformation } from './components/sections/ImportantInformation';
import { Information } from './components/sections/Information';
import { Introduction } from './components/sections/Introduction';
import { OptionalElement } from './components/sections/OptionalElement';
import { OutOfScope } from './components/sections/OutOfScope';
import { Prerequisites } from './components/sections/Prerequisites';
import { Scope } from './components/sections/Scope';
import { SectionsChecboxes } from './components/sections/SectionsChecboxes';
import { SelfDeclaration } from './components/sections/SelfDeclaration';

export default function FormIntroPage({ form }: { form: Form }) {
  const { changeForm } = useForm();

  const { sections, enabled } = form.introPage ?? {
    enabled: false,
    introduction: '',
    sections: {
      prerequisites: { title: '', description: '' },
      dataTreatment: { title: '', description: '' },
    },
    selfDeclaration: '',
  };
  const { scope, outOfScope, dataDisclosure, optional, automaticProcessing, importantInformation } = sections ?? {};

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
            <Information />
            {automaticProcessing && <AutomaticProcessing form={form} handleChange={changeForm} />}
            {optional && <OptionalElement form={form} handleChange={changeForm} />}
            <SelfDeclaration form={form} handleChange={changeForm} />
          </>
        )}
      </RowLayout>
    </AppLayout>
  );
}
