import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";

const FormRow = ({ form }) => {
  // @ts-ignore
  const { config } = useAppConfig();
  const paper = navFormUtils.isSubmissionMethodAllowed("paper", form);
  const digital = navFormUtils.isSubmissionMethodAllowed("digital", form);
  const ingen = form.properties.innsending === "INGEN";
  const isDevelopment = config?.isDevelopment;

  return (
    <tr>
      <td>
        <a href={`/fyllut/${form.path}`}>{form.title}</a>
      </td>
      {isDevelopment && (
        <>
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
