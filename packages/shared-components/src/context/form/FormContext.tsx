import {
  Component,
  NavFormType,
  navFormUtils,
  PrefillData,
  Submission,
} from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from 'react';
import { useResolvedPath } from 'react-router-dom';
import UtilsOverrides from '../../formio/overrides/utils-overrides/utils-overrides';
import { useAppConfig } from '../config/configContext';

interface FormContextType {
  submission?: Submission;
  setSubmission: Dispatch<SetStateAction<Submission | undefined>>;
  prefillData?: PrefillData;
  activeComponents: Component[];
  form: NavFormType;
  formUrl: string;
  formProgress: boolean;
  setFormProgress: Dispatch<SetStateAction<boolean>>;
}

interface FormProviderProps {
  children: React.ReactNode;
  form: NavFormType;
}

const FormContext = createContext<FormContextType>({} as FormContextType);

export const FormProvider = ({ children, form }: FormProviderProps) => {
  const [submission, setSubmission] = useState<Submission>();
  const [activeComponents, setActiveComponents] = useState<Component[]>(form.components);
  const [formProgress, setFormProgress] = useState<boolean>(false);
  const [prefillData, setPrefillData] = useState<PrefillData>({});
  const { http, baseUrl, submissionMethod } = useAppConfig();
  const formUrl = useResolvedPath('').pathname;

  const checkConditions = useCallback(
    (components: Component[]): Component[] => {
      return components
        .map((component) => {
          // TODO: row and instance?
          if (!UtilsOverrides.checkCondition(component, undefined, submission?.data, form, undefined, submission)) {
            console.log('Ignore component', component);
            return;
          }

          if (component.components?.length) {
            component.components = checkConditions(component.components);
          }

          return component;
        })
        .filter((component) => component !== undefined);
    },
    [form, submission],
  );

  useEffect(() => {
    const loadPrefillData = async (navForm: NavFormType) => {
      const prefillComponents = navFormUtils.findComponentsByProperty('prefillKey', navForm);
      // No need to fetch prefill data if there are no components with prefillKey
      if (prefillComponents.length === 0) return null;

      // No need to fetch prefill data if submission method is paper (currently not supported)
      if (submissionMethod !== 'digital') return null;

      const properties = prefillComponents.map((component) => component.prefillKey);
      const uniqueProperties = [...new Set(properties)].join(',');

      const fyllutPrefillData = await http?.get<PrefillData>(
        `${baseUrl}/api/send-inn/prefill-data?properties=${uniqueProperties}`,
      );

      if (fyllutPrefillData) setPrefillData(fyllutPrefillData);
    };

    if (form) {
      loadPrefillData(form);
    }
  }, [baseUrl, form, http, submissionMethod]);

  useEffect(() => {
    setActiveComponents(checkConditions(JSON.parse(JSON.stringify(form.components))));
  }, [form, checkConditions]);

  return (
    <FormContext.Provider
      value={{
        prefillData,
        submission,
        setSubmission,
        activeComponents,
        form,
        formUrl,
        formProgress,
        setFormProgress,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => useContext(FormContext);
