import { makeStyles, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { FormsResponseForm, isNoneSubmission, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';

interface FormRowProps {
  form: FormsResponseForm;
}

const useStyles = makeStyles({
  skjemanummer: {
    textWrap: 'nowrap',
    paddingRight: '50px',
    verticalAlign: 'top',
  },
});

const FormRow = ({ form }: FormRowProps) => {
  const { config, baseUrl } = useAppConfig();
  const styles = useStyles();
  const paper = navFormUtils.isSubmissionMethodAllowed('paper', form);
  const digital = navFormUtils.isSubmissionMethodAllowed('digital', form);
  const ingen = isNoneSubmission(form.properties.submissionTypes);
  const isDevelopment = config?.isDevelopment;
  const skjemaPath = `${baseUrl}/${form.path}`;

  return (
    <tr>
      <td className={styles.skjemanummer}>
        <a href={skjemaPath}>{form.properties.skjemanummer}</a>
      </td>
      <td>
        <a href={skjemaPath}>{form.title}</a>
      </td>
      {isDevelopment && (
        <>
          <td>
            {paper && (
              <span>
                [<a href={`/fyllut/${form.path}${digital ? '?sub=paper' : ''}`}>papir</a>]
              </span>
            )}
          </td>
          <td>
            {digital && (
              <span>
                [<a href={`/fyllut/${form.path}?sub=digital`}>digital</a>]
              </span>
            )}
          </td>
          <td>
            {ingen && (
              <span>
                [<a href={`/fyllut/${form.path}`}>ingen</a>]
              </span>
            )}
          </td>
        </>
      )}
    </tr>
  );
};

export default FormRow;
