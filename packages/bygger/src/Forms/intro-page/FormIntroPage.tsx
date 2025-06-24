import { Heading } from '@navikt/ds-react';
import { useAppConfig, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import { useForm } from '../../context/old_form/FormContext';
import { useEditFormTranslations } from '../../context/translations/EditFormTranslationsContext';
import { useFormTranslations } from '../../context/translations/FormTranslationsContext';
import PublishModalComponents from '../publish/PublishModalComponents';
import FormSkeleton from '../skeleton/FormSkeleton';
import { EnableIntroPageSwitch } from './components/EnableIntroPageSwitch';
import { FormIntroPageSidebar } from './components/FormIntroPageSidebar';
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
  const { logger } = useAppConfig();
  const { changeForm, saveForm } = useForm();
  const { isReady } = useFormTranslations();
  const { saveChanges } = useEditFormTranslations();

  const { sections, importantInformation } = form.introPage ?? {
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

  function handleValidation(onSuccess: () => void) {
    const errors = validateIntroPage(form.introPage);
    const isError = errors && Object.keys(errors).length > 0;

    if (isError) {
      setErrors(errors);
      scrollToFirstError(errors);
    } else {
      onSuccess();
      setErrors(undefined);
    }
  }

  const handleSave = async () => {
    try {
      await saveChanges();
      await saveForm(form);
    } catch (error: any) {
      logger?.debug(`Failed to save introPage: ${error.message}`, error);
    }
  };

  async function handleSubmit() {
    if (!form.introPage?.enabled) {
      await handleSave();
      return;
    }

    handleValidation(async () => await handleSave());
  }

  function validateAndOpenPublishSettingModal() {
    handleValidation(() => setOpenPublishSettingModal(true));
  }

  if (!isReady) {
    return <FormSkeleton leftSidebar={true} rightSidebar={true} />;
  }

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
            validateAndOpenPublishSettingModal={validateAndOpenPublishSettingModal}
            setOpenPublishSettingModal={setOpenPublishSettingModal}
          />
        }
      >
        <Heading level="2" size="large" spacing>
          Standard introside
        </Heading>

        <EnableIntroPageSwitch form={form} onChange={changeForm} />

        <SectionsChecboxes form={form} onChange={changeForm} />
        <Introduction form={form} handleChange={changeForm} errors={errors} ref={refMap['introduction']} />
        {importantInformation && (
          <ImportantInformation form={form} handleChange={changeForm} errors={errors} refMap={refMap} />
        )}
        {scope && <Scope form={form} handleChange={changeForm} errors={errors} refMap={refMap} />}
        {outOfScope && <OutOfScope form={form} handleChange={changeForm} errors={errors} refMap={refMap} />}
        <Prerequisites
          form={form}
          submissionMethod={'paper'}
          handleChange={changeForm}
          errors={errors}
          refMap={refMap}
        />
        {dataDisclosure && <DataDisclosure form={form} handleChange={changeForm} refMap={refMap} errors={errors} />}
        <DataTreatment form={form} handleChange={changeForm} errors={errors} refMap={refMap} />
        <DataStorage submissionMethod={'paper'} />
        {automaticProcessing && (
          <AutomaticProcessing form={form} handleChange={changeForm} errors={errors} refMap={refMap} />
        )}
        {optional && <Optional form={form} handleChange={changeForm} refMap={refMap} errors={errors} />}
        <SelfDeclaration ref={refMap['selfDeclaration']} form={form} handleChange={changeForm} errors={errors} />

        <PublishModalComponents
          form={form}
          openPublishSettingModal={openPublishSettingModal}
          setOpenPublishSettingModal={setOpenPublishSettingModal}
        />
      </RowLayout>
    </AppLayout>
  );
}
