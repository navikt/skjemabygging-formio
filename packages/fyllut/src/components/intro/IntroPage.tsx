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

  const loadForm = useCallback(async () => {
    if (!formPath) {
      return;
    }
    setForm(await get(formPath)); // Fetch only properties and intro page data
  }, [formPath, get]);

  useEffect(() => {
    (async () => {
      await loadForm();
    })();
  }, [formPath, loadForm]);

  if (!form) {
    return <FormPageSkeleton />;
  }

  if (submissionMethod && !navFormUtils.isSubmissionMethodAllowed(submissionMethod, form)) {
    return <SubmissionMethodNotAllowed submissionMethod={submissionMethod} />;
  }

  return (
    <IntroPageProvider form={form}>
      <FormContainer>
        <div className="fyllut-layout">
          <div className="main-col"></div>
          <div className="right-col">
            <LanguageSelector />
          </div>
        </div>
      </FormContainer>
      <FormTitle form={formioFormsApiUtils.mapFormToNavForm(form)} />
      <FormContainer>
        <div className="fyllut-layout">
          <div className="main-col">
            <SelectSubmissionType />
            <IntroPageStatic />
          </div>
          <div className="right-col"></div>
        </div>
      </FormContainer>
    </IntroPageProvider>
  );
};

export default IntroPage;
