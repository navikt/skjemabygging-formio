import { makeStyles } from "@material-ui/styles";
import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";

const useStyles = makeStyles({
  tableRow: {
    "&:nth-of-type(odd)": {
      backgroundColor: "#cbcbcb",
    },
  },
});

const FormRow = ({ form }) => {
  const styles = useStyles();
  const paper = navFormUtils.isSubmissionMethodAllowed("paper", form);
  const digital = navFormUtils.isSubmissionMethodAllowed("digital", form);
  const ingen = form.properties.innsending === "INGEN";

  return (
    <tr className={styles.tableRow}>
      <td>{form.title}</td>
      <td>
        {paper && (
          <span>
            [<a href={`/fyllut/${form.path}${digital ? "?sub=paper" : ""}`}>papir</a>]
          </span>
        )}
      </td>
      <td>
        {digital && (
          <span>
            [<a href={`/fyllut/${form.path}${paper ? "?sub=digital" : ""}`}>digital</a>]
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
    </tr>
  );
};

export default FormRow;
