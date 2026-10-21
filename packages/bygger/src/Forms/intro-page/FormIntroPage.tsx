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
import { getTextKeysFromForm } from '../../translations/utils/formTextsUtils';
import PublishModalComponents from '../publish/PublishModalComponents';
import FormSkeleton from '../skeleton/FormSkeleton';
import { EnableIntroPageSwitch } from './components/EnableIntroPageSwitch';
import { FormIntroPageSidebar } from './components/FormIntroPageSidebar';
import { AutomaticProcessing } from './sections/AutomaticProcessing';
import { BeAwareOf } from './sections/BeAwareOf';
import { DataDisclosure } from './sections/DataDisclosure';
import { DataStorage } from './sections/DataStorage';
import { ImportantInformation } from './sections/ImportantInformation';
import { Introduction } from './sections/Introduction';
import { Optional } from './sections/Optional';
import { OutOfScope } from './sections/OutOfScope';
import { Prerequisites } from './sections/Prerequisites';
import { Scope } from './sections/Scope';
import { SectionsChecboxes } from './sections/SectionsChecboxes';
import { SelfDeclaration } from './sections/SelfDeclaration';
import { sanitizeIntroPage } from './utils/sanitizeIntroPage';
import { useIntroPageRefs } from './validation/useIntroPageRefs';
import { useScrollToFirstError } from './validation/useScrollToFirstError';
import { getMissingTextErrors, IntroPageError, validateIntroPage } from './validation/validation';

const fieldErrorMessage =
  'Endringene ble ikke lagret fordi introsiden har valideringsfeil. Rett opp feltene markert med rødt.';

export default function FormIntroPage({ form }: { form: Form }) {
  const { logger } = useAppConfig();
  const { changeForm, saveForm } = useForm();
  const { isReady: formTranslationsReady } = useFormTranslations();
  const { isReady: globalTranslationsReady } = useGlobalTranslations();
  const { saveChanges, validateChanges } = useEditFormTranslations();
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

  const hasErrors = (validationErrors: IntroPageError) => Object.keys(validationErrors).length > 0;

  const clearErrors = () => {
    setErrors(undefined);
    setSaveErrorMessage(undefined);
  };

  const showErrors = (validationErrors: IntroPageError, message?: string) => {
    setErrors(validationErrors);
    setSaveErrorMessage(message);
    if (scrollAnimationFrameRef.current) {
      window.cancelAnimationFrame(scrollAnimationFrameRef.current);
    }
    scrollAnimationFrameRef.current = window.requestAnimationFrame(() => {
      scrollToFirstError(validationErrors);
      scrollAnimationFrameRef.current = undefined;
    });
  };

  function handleValidation(onSuccess: () => void) {
    const validationErrors = validateIntroPage(form.introPage, getKeyBasedText);

    if (hasErrors(validationErrors)) {
      showErrors(validationErrors, form.introPage?.enabled ? fieldErrorMessage : undefined);
      return;
    }
    clearErrors();
    onSuccess();
  }

  const handleSave = async () => {
    const activeKeys = getTextKeysFromForm(form);
    const missingTextKeys = validateChanges(activeKeys)
      .filter((error) => error.type === 'MISSING_BOKMAL_VALIDATION')
      .map((error) => error.key);
    const missingTextErrors = getMissingTextErrors(form.introPage, missingTextKeys);
    if (hasErrors(missingTextErrors)) {
      showErrors(missingTextErrors, fieldErrorMessage);
      return;
    }

    try {
      if (!(await saveChanges(activeKeys))) {
        setSaveErrorMessage('Endringene ble ikke lagret. Rett opp valideringsfeilene i oversettelsene.');
        return;
      }
      await saveForm(form.introPage ? { ...form, introPage: sanitizeIntroPage(form.introPage) } : form);
    } catch (error: any) {
      logger?.debug(`Failed to save introPage: ${error.message}`, error);
    }
  };

  async function handleSubmit() {
    if (form.introPage?.enabled) {
      handleValidation(handleSave);
      return;
    }

    clearErrors();
    await handleSave();
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
      form={form}
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
        <DataStorage submissionMethod={submissionMethod} />
        {automaticProcessing && (
          <AutomaticProcessing form={form} handleChange={changeForm} errors={errors} refMap={refMap} />
        )}
        {optional && <Optional form={form} handleChange={changeForm} refMap={refMap} errors={errors} />}
        {/* eslint-disable-next-line react-hooks/refs */}
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
