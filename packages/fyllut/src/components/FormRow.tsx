import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  tableRow: {
    "&:nth-of-type(odd)": {
      backgroundColor: "#cbcbcb",
    },
  },
});

const FormRow = ({ form }) => {
  const styles = useStyles();
  const { innsending } = form.properties;
  const paper = !innsending || innsending === "KUN_PAPIR" || innsending === "PAPIR_OG_DIGITAL";
  const digital = !innsending || innsending === "KUN_DIGITAL" || innsending === "PAPIR_OG_DIGITAL";
  const ingen = innsending === "INGEN";

  return (
    <tr className={styles.tableRow}>
      <td>{form.title}</td>
      <td>
        {paper && (
          <span>
            [<a href={`/fyllut/${form.path}?sub=paper`}>papir</a>]
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
    </tr>
  );
};

export default FormRow;
