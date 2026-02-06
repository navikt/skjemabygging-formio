import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import FormRadio from './FormRadio';

interface Props {
  submissionPath: string;
}

const StaticPdfNavigation = ({ submissionPath }: Props) => {
  const { updateSubmission, submission } = useForm();

  const handleChange = (value: string) => {
    updateSubmission(submissionPath, value);
    if (submission?.data.coverPage['user']) {
      updateSubmission('coverPage.user', undefined);
    }
  };

  return (
    <FormRadio
      submissionPath={submissionPath}
      legend={TEXTS.statiske.identity.submissionFor}
      values={[
        {
          label: TEXTS.statiske.identity.personIdentityNumber,
          value: 'identityNumber',
        },
        {
          label: TEXTS.statiske.identity.personNoIdentityNumber,
          value: 'noIdentityNumber',
        },
      ]}
      onChange={handleChange}
    />
  );
};

export default StaticPdfNavigation;
