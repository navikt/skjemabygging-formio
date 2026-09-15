import { FormSummary } from '@navikt/ds-react';
import { Form, Submission, TEXTS, Tkey, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation, useNavigate } from 'react-router';
import ValidationExclamationIcon from '../../../components/icons/ValidationExclamationIcon';
import styles from './SummaryIntroPage.module.css';

interface Props {
  submission: Submission;
  form: Form;
  translate: TranslateFunction;
}

const SummaryIntroPage = (props: Props) => {
  const { submission, form, translate } = props;
  const { search, state } = useLocation();
  const navigate = useNavigate();

  if (!form.introPage?.enabled) {
    return null;
  }

  const inputLabel: Tkey = 'introPage.selfDeclaration.inputLabel';

  return (
    <FormSummary className={styles.panel}>
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
        <FormSummary.EditLink
          href={search ? `../${search}` : '../'}
          onClick={(event) => {
            event.preventDefault();
            navigate({ pathname: '../', search }, { state });
          }}
        >
          {translate(TEXTS.grensesnitt.summaryPage.edit)}
        </FormSummary.EditLink>
      </FormSummary.Footer>
    </FormSummary>
  );
};

export default SummaryIntroPage;
