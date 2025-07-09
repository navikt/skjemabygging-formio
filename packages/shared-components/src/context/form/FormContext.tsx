import { NavFormType, navFormUtils, PrefillData, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useResolvedPath, useSearchParams } from 'react-router-dom';
import { useAppConfig } from '../config/configContext';

interface FormContextType {
  submission?: Submission;
  setSubmission: Dispatch<SetStateAction<Submission | undefined>>;
  prefillData?: PrefillData;
  form: NavFormType;
  formUrl: string;
  formProgress: boolean;
  setFormProgress: Dispatch<SetStateAction<boolean>>;
  redirectIfMissingInnsendingsId: () => void;
}

interface FormProviderProps {
  children: React.ReactNode;
  form: NavFormType;
}

const FormContext = createContext<FormContextType>({} as FormContextType);

export const FormProvider = ({ children, form }: FormProviderProps) => {
  const [submission, setSubmission] = useState<Submission>();
  const [formProgress, setFormProgress] = useState<boolean>(false);
  const [prefillData, setPrefillData] = useState<PrefillData>({});
  const { http, baseUrl, submissionMethod } = useAppConfig();
  const formUrl = useResolvedPath('').pathname;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  const redirectIfMissingInnsendingsId = useCallback(() => {
    if (!submission && submissionMethod === 'digital' && !searchParams.get('innsendingsId')) {
      searchParams.delete('innsendingsId');

      navigate(`${formUrl}?${searchParams.toString()}`);
    }
  }, [formUrl, navigate, searchParams, submission, submissionMethod]);

  return (
    <FormContext.Provider
      value={{
        prefillData,
        submission,
        setSubmission,
        form,
        formUrl,
        formProgress,
        setFormProgress,
        redirectIfMissingInnsendingsId,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => useContext(FormContext);
