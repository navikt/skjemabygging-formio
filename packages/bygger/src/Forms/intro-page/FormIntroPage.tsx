import { Heading } from '@navikt/ds-react';
import { useModal } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import { useForm } from '../../context/old_form/FormContext';
import PublishModalComponents from '../publish/PublishModalComponents';
import { EnableIntroPageSwitch } from './components/EnableIntroPageSwitch';
import { FormIntroPageSidebar } from './FormIntroPageSidebar';
import { AutomaticProcessing } from './sections/AutomaticProcessing';
import { DataDisclosure } from './sections/DataDisclosure';
import { DataStorage } from './sections/DataStorage';
import { DataTreatment } from './sections/DataTreatment';
import { ImportantInformation } from './sections/ImportantInformation';
import { Introduction } from './sections/Introduction';
import { Optional } from './sections/Optional';
import { OutOfScope } from './sections/OutOfScope';
import { Prerequisites } from './sections/Prerequisites';
import { Scope } from './sections/Scope';
import { SectionsChecboxes } from './sections/SectionsChecboxes';
import { SelfDeclaration } from './sections/SelfDeclaration';
import { useIntroPageRefs } from './validation/useIntroPageRefs';
import { useScrollToFirstError } from './validation/useScrollToFirstError';
import { IntroPageError, validateIntroPage } from './validation/validation';

export default function FormIntroPage({ form }: { form: Form }) {
  const { changeForm, saveForm } = useForm();

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

  const refMap = useIntroPageRefs();
  const scrollToFirstError = useScrollToFirstError(refMap);
  const [errors, setErrors] = useState<IntroPageError>();
  const [openPublishSettingModal, setOpenPublishSettingModal] = useModal();

  const handleSubmit = async () => {
    const errors = validateIntroPage(form.introPage);
    const isError = Object.keys(errors).length > 0 && form.introPage?.enabled;
    if (isError) {
      setErrors(errors);
      scrollToFirstError(errors);
    } else {
      await saveForm(form);
      setErrors(undefined);
    }
  };

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

      <RowLayout
        right={
          <FormIntroPageSidebar
            form={form}
            validateAndSave={handleSubmit}
            setOpenPublishSettingModal={setOpenPublishSettingModal}
          />
        }
      >
        <Heading level="2" size="large" spacing>
          Standard introside
        </Heading>

        <EnableIntroPageSwitch form={form} onChange={changeForm} />

        {enabled && (
          <>
            <SectionsChecboxes form={form} onChange={changeForm} />
            <Introduction form={form} handleChange={changeForm} errors={errors} ref={refMap['introduction']} />
            {importantInformation && (
              <ImportantInformation form={form} handleChange={changeForm} errors={errors} refMap={refMap} />
            )}
            {scope && <Scope form={form} handleChange={changeForm} errors={errors} refMap={refMap} />}
            {outOfScope && <OutOfScope form={form} handleChange={changeForm} errors={errors} refMap={refMap} />}
            <Prerequisites form={form} handleChange={changeForm} errors={errors} refMap={refMap} />
            {dataDisclosure && <DataDisclosure form={form} handleChange={changeForm} refMap={refMap} errors={errors} />}
            <DataTreatment form={form} handleChange={changeForm} errors={errors} refMap={refMap} />
            <DataStorage />
            {automaticProcessing && (
              <AutomaticProcessing form={form} handleChange={changeForm} errors={errors} refMap={refMap} />
            )}
            {optional && <Optional form={form} handleChange={changeForm} refMap={refMap} errors={errors} />}
            <SelfDeclaration ref={refMap['selfDeclaration']} form={form} handleChange={changeForm} errors={errors} />
          </>
        )}
        <PublishModalComponents
          form={form}
          openPublishSettingModal={openPublishSettingModal}
          setOpenPublishSettingModal={setOpenPublishSettingModal}
        />
      </RowLayout>
    </AppLayout>
  );
}
