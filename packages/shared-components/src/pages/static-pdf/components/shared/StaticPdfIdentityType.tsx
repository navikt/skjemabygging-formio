import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import FormRadio from './FormRadio';

interface Props {
  submissionPath: string;
}

const StaticPdfNavigation = ({ submissionPath }: Props) => {
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
    />
  );
};

export default StaticPdfNavigation;
