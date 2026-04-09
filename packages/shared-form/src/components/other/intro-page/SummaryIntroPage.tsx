import { FormSummary } from '@navikt/ds-react';
import { Form, Submission, TEXTS, Tkey, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { Link, useLocation } from 'react-router';
import ValidationExclamationIcon from '../../../../components/icons/ValidationExclamationIcon';

interface Props {
  submission: Submission;
  form: Form;
  translate: TranslateFunction;
}

/**
 * This component renders a summary for the intro page.
 * This is not inside the form definition so it works differently then the other summary components
 * @constructor
 */
const SummaryIntroPage = (props: Props) => {
  const { submission, form, translate } = props;
  const { search } = useLocation();

  if (!form.introPage?.enabled) {
    return null;
  }

  const inputLabel: Tkey = 'introPage.selfDeclaration.inputLabel';

  return (
    <FormSummary>
      <FormSummary.Header>
        <FormSummary.Heading level="3">
          {translate(TEXTS.grensesnitt.introPage.title)}
          {!submission?.selfDeclaration && (
            <ValidationExclamationIcon title={translate(TEXTS.statiske.summaryPage.validationIcon)} />
          )}
        </FormSummary.Heading>
      </FormSummary.Header>
      <FormSummary.Answers>
        <FormSummary.Answer>
          <FormSummary.Label>{translate(inputLabel)}</FormSummary.Label>
          <FormSummary.Value>{submission?.selfDeclaration ? translate(TEXTS.common.yes) : '-'}</FormSummary.Value>
        </FormSummary.Answer>
      </FormSummary.Answers>

      <FormSummary.Footer>
        <FormSummary.EditLink as={Link} to={{ pathname: '../', search }}>
          {translate(TEXTS.grensesnitt.summaryPage.edit)}
        </FormSummary.EditLink>
      </FormSummary.Footer>
    </FormSummary>
  );
};

export default SummaryIntroPage;
