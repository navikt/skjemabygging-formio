import { Heading } from '@navikt/ds-react';
import { useAppConfig, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { Form, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useRef, useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import { useForm } from '../../context/old_form/FormContext';
import { useEditFormTranslations } from '../../context/translations/EditFormTranslationsContext';
import { useFormTranslations } from '../../context/translations/FormTranslationsContext';
import { useGlobalTranslations } from '../../context/translations/GlobalTranslationsContext';
import useKeyBasedText from '../../hooks/useKeyBasedText';
import PublishModalComponents from '../publish/PublishModalComponents';
import FormSkeleton from '../skeleton/FormSkeleton';
import { EnableIntroPageSwitch } from './components/EnableIntroPageSwitch';
import { FormIntroPageSidebar } from './components/FormIntroPageSidebar';
import { AutomaticProcessing } from './sections/AutomaticProcessing';
import { BeAwareOf } from './sections/BeAwareOf';
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
  const { isReady: formTranslationsReady } = useFormTranslations();
  const { isReady: globalTranslationsReady } = useGlobalTranslations();
  const { saveChanges } = useEditFormTranslations();
  const { getKeyBasedText } = useKeyBasedText();

  const { sections, importantInformation } = form.introPage ?? {
    enabled: false,
    introduction: '',
    sections: {},
    selfDeclaration: '',
  };
  const { scope, outOfScope, prerequisites, optional, automaticProcessing } = sections ?? {};

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
  const [saveErrorMessage, setSaveErrorMessage] = useState<string>();
  const [submissionMethod, setSubmissionMethod] = useState<SubmissionMethod>('digital');
  const [openPublishSettingModal, setOpenPublishSettingModal] = useModal();
  const scrollAnimationFrameRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (scrollAnimationFrameRef.current) {
        window.cancelAnimationFrame(scrollAnimationFrameRef.current);
      }
    };
  }, []);

  function handleValidation(onSuccess: () => void) {
    const validationErrors = validateIntroPage(form.introPage, getKeyBasedText);
    const hasErrors = validationErrors && Object.keys(validationErrors).length > 0;

    if (hasErrors) {
      setErrors(validationErrors);
      if (form.introPage?.enabled) {
        setSaveErrorMessage(
          'Endringene ble ikke lagret fordi introsiden har valideringsfeil. Rett opp feltene markert med rødt.',
        );
      }
      if (scrollAnimationFrameRef.current) {
        window.cancelAnimationFrame(scrollAnimationFrameRef.current);
      }
      scrollAnimationFrameRef.current = window.requestAnimationFrame(() => {
        scrollToFirstError(validationErrors);
        scrollAnimationFrameRef.current = undefined;
      });
    } else {
      onSuccess();
      setErrors(undefined);
      setSaveErrorMessage(undefined);
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
      setSaveErrorMessage(undefined);
      await handleSave();
      return;
    }

    handleValidation(async () => await handleSave());
  }

  function validateAndOpenPublishSettingModal() {
    handleValidation(() => setOpenPublishSettingModal(true));
  }

  if (!(formTranslationsReady && globalTranslationsReady)) {
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
            validationErrorMessage={saveErrorMessage}
          />
        }
      >
        <Heading level="2" size="large" spacing>
          Standard introside
        </Heading>

        <EnableIntroPageSwitch form={form} onChange={changeForm} />

        <SectionsChecboxes
          form={form}
          onChange={changeForm}
          onToggleSubmissionMethod={(value) => setSubmissionMethod(value)}
        />
        <Introduction form={form} handleChange={changeForm} errors={errors} ref={refMap['introduction']} />
        {importantInformation && (
          <ImportantInformation form={form} handleChange={changeForm} errors={errors} refMap={refMap} />
        )}
        {scope && <Scope form={form} handleChange={changeForm} errors={errors} refMap={refMap} />}
        {outOfScope && <OutOfScope form={form} handleChange={changeForm} errors={errors} refMap={refMap} />}
        {prerequisites && (
          <Prerequisites
            form={form}
            submissionMethod={submissionMethod}
            handleChange={changeForm}
            errors={errors}
            refMap={refMap}
          />
        )}
        <BeAwareOf submissionMethod={submissionMethod} />
        <DataDisclosure form={form} handleChange={changeForm} refMap={refMap} errors={errors} />
        <DataTreatment form={form} handleChange={changeForm} errors={errors} refMap={refMap} />
        <DataStorage submissionMethod={submissionMethod} />
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
