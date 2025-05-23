import {
  FormContainer,
  FormTitle,
  LanguageSelector,
  useAppConfig,
} from '@navikt/skjemadigitalisering-shared-components';
import {
  Form,
  formioFormsApiUtils,
  FormPropertiesType,
  navFormUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useFormsApiForms from '../../api/useFormsApiForms';
import { NotFoundPage } from '../errors/NotFoundPage';
import FormPageSkeleton from '../form/FormPageSkeleton';
import SubmissionMethodNotAllowed from '../SubmissionMethodNotAllowed';
import { IntroPageProvider } from './IntroPageContext';
import IntroPageDynamic from './IntroPageDynamic';
import IntroPageStatic from './IntroPageStatic';
import SelectSubmissionType from './SelectSubmissionType';

const IntroPage = () => {
  const { formPath } = useParams();
  const [form, setForm] = useState<Form>();
  const { get } = useFormsApiForms();
  const { submissionMethod } = useAppConfig();
  const [loading, setLoading] = useState<boolean>(true);

  // TODO: Delete
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const testData = {
    skjemanummer: 'nav-1234',
    title: 'test',
    introPage: {
      enabled: true,
      introduction: 'Introduction text',
      sections: {
        scope: {
          title: 'Scope',
          description: 'Scope description',
          bulletPoints: ['Bullet point 1', 'Bullet point 2'],
        },
        outOfScope: {
          title: 'Out of scope',
          description: 'Out of scope description',
          bulletPoints: ['Bullet point 1', 'Bullet point 2'],
        },
        prerequisites: {
          title: 'Prerequisites',
          description: 'Prerequisites description',
          bulletPoints: ['Bullet point 1', 'Bullet point 2'],
        },
        dataDisclosure: {
          title: 'Data disclosure',
          description: 'Data disclosure description',
          bulletPoints: ['Bullet point 1', 'Bullet point 2'],
        },
        dataTreatment: {
          title: 'Data treatment',
          description: 'Data treatment description',
          bulletPoints: ['Bullet point 1', 'Bullet point 2'],
        },
        dataStorage: {
          title: 'Data storage',
          description: 'Data storage description',
          bulletPoints: ['Bullet point 1', 'Bullet point 2'],
        },
        automaticProcessing: {
          title: 'Automatic processing',
          description: 'Automatic processing description',
          bulletPoints: ['Bullet point 1', 'Bullet point 2'],
        },
        optional: {
          title: 'Optional',
          description: 'Optional description',
          bulletPoints: ['Bullet point 1', 'Bullet point 2'],
        },
      },
      selfDeclaration: 'Self declaration text',
    },
    properties: {
      submissionTypes: ['DIGITAL', 'PAPER'],
    } as FormPropertiesType,
  } as Form;

  const loadForm = useCallback(async () => {
    if (!formPath) {
      return;
    }
    setLoading(true);
    try {
      const formData = await get(formPath);
      if (formData) {
        // TODO: Fetch only properties and intro page data
        setForm(await get(formPath));
        // TODO: Delete
        //setForm(testData);
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
    return <NotFoundPage />;
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
        {form.introPage?.enabled ? <IntroPageDynamic /> : <IntroPageStatic />}
      </FormContainer>
    </IntroPageProvider>
  );
};

export default IntroPage;
