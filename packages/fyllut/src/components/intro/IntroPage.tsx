import {
  FormContainer,
  FormTitle,
  LanguageSelector,
  useAppConfig,
} from '@navikt/skjemadigitalisering-shared-components';
import { Form, formioFormsApiUtils, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useFormsApiForms from '../../api/useFormsApiForms';
import { ErrorPageWrapper } from '../errors/ErrorPageWrapper';
import FormPageSkeleton from '../form/FormPageSkeleton';
import SubmissionMethodNotAllowed from '../SubmissionMethodNotAllowed';
import { IntroPageProvider } from './IntroPageContext';
import IntroPageStatic from './IntroPageStatic';
import SelectSubmissionType from './SelectSubmissionType';

const IntroPage = () => {
  const { formPath } = useParams();
  const [form, setForm] = useState<Form>();
  const { get } = useFormsApiForms();
  const { submissionMethod } = useAppConfig();
  const [loading, setLoading] = useState<boolean>(true);

  const loadForm = useCallback(async () => {
    if (!formPath) {
      return;
    }
    setLoading(true);
    try {
      const formData = await get(formPath);
      if (formData) {
        setForm(await get(formPath)); // Fetch only properties and intro page data
      }
    } finally {
      setLoading(false);
    }
  }, [formPath, get]);

  useEffect(() => {
    (async () => {
      await loadForm();
    })();
  }, [formPath, loadForm]);

  if (loading) {
    return <FormPageSkeleton />;
  }

  if (!form) {
    return <ErrorPageWrapper statusCode={404} />;
  }

  if (submissionMethod && !navFormUtils.isSubmissionMethodAllowed(submissionMethod, form)) {
    return <SubmissionMethodNotAllowed submissionMethod={submissionMethod} />;
  }

  return (
    <IntroPageProvider form={form}>
      <FormContainer small={false}>
        <LanguageSelector />
      </FormContainer>
      <FormContainer small={true}>
        <FormTitle form={formioFormsApiUtils.mapFormToNavForm(form)} />
        <SelectSubmissionType />
        <IntroPageStatic />
      </FormContainer>
    </IntroPageProvider>
  );
};

export default IntroPage;
